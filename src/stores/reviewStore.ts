import { create } from 'zustand'
import { NormalizedReview, ReviewFilters, PropertyStats } from '@/types/review'

interface ReviewState {
    reviews: NormalizedReview[]
    filteredReviews: NormalizedReview[]
    properties: PropertyStats[]
    filters: ReviewFilters
    loading: boolean
    error: string | null
    selectedReviews: Set<string>
    syncingReviewIds: Set<string>
}

interface ReviewActions {
    setReviews: (reviews: NormalizedReview[]) => void
    setFilters: (filters: Partial<ReviewFilters>) => void
    clearFilters: () => void
    updateReviewStatus: (reviewId: string, status: 'approved' | 'rejected' | 'pending') => void
    toggleReviewSelection: (reviewId: string) => void
    selectAllReviews: () => void
    clearSelection: () => void
    bulkUpdateStatus: (status: 'approved' | 'rejected') => void
    // Internal helpers for optimistic UI
    _applyLocalStatus: (ids: string[], status: 'approved' | 'rejected' | 'pending') => void
    _revertLocalStatus: (snapshot: NormalizedReview[]) => void
    _enqueueAndTrackJob: (affectedIds: string[], endpoint: string, payload: any) => Promise<void>
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    fetchReviews: () => Promise<void>
}

type ReviewStore = ReviewState & ReviewActions

const initialFilters: ReviewFilters = {
    status: 'all'
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
    // State
    reviews: [],
    filteredReviews: [],
    properties: [],
    filters: initialFilters,
    loading: false,
    error: null,
    selectedReviews: new Set(),
    syncingReviewIds: new Set(),

    // Actions
    setReviews: (reviews) => {
        const properties = calculatePropertyStats(reviews)
        set({
            reviews,
            properties,
            filteredReviews: applyFilters(reviews, get().filters)
        })
    },

    setFilters: (newFilters) => {
        const filters = { ...get().filters, ...newFilters }
        const filteredReviews = applyFilters(get().reviews, filters)
        set({ filters, filteredReviews })
    },

    clearFilters: () => {
        const filteredReviews = applyFilters(get().reviews, initialFilters)
        set({ filters: initialFilters, filteredReviews })
    },

    updateReviewStatus: async (reviewId, status) => {
        const current = get().reviews
        const snapshot = current.filter(r => r.id === reviewId)
        // Optimistic apply
        get()._applyLocalStatus([reviewId], status)
        try {
            await get()._enqueueAndTrackJob([reviewId], '/api/reviews/update-status', { id: reviewId, status })
        } catch (e) {
            // Revert on terminal failure
            get()._revertLocalStatus(snapshot)
        }
    },

    toggleReviewSelection: (reviewId) => {
        const selectedReviews = new Set(get().selectedReviews)
        if (selectedReviews.has(reviewId)) {
            selectedReviews.delete(reviewId)
        } else {
            selectedReviews.add(reviewId)
        }
        set({ selectedReviews })
    },

    selectAllReviews: () => {
        const selectedReviews = new Set(get().filteredReviews.map(r => r.id))
        set({ selectedReviews })
    },

    clearSelection: () => {
        set({ selectedReviews: new Set() })
    },

    bulkUpdateStatus: async (status) => {
        const selectedIds = Array.from(get().selectedReviews)
        const snapshot = get().reviews.filter(r => selectedIds.includes(r.id))
        get()._applyLocalStatus(selectedIds, status)
        try {
            await get()._enqueueAndTrackJob(selectedIds, '/api/reviews/bulk-update-status', { ids: selectedIds, status })
            set({ selectedReviews: new Set() })
        } catch (e) {
            get()._revertLocalStatus(snapshot)
        }
    },

    _applyLocalStatus: (ids, status) => {
        const reviews = get().reviews.map(r => ids.includes(r.id) ? { ...r, status } : r)
        const filteredReviews = applyFilters(reviews, get().filters)
        set({ reviews, filteredReviews })
    },

    _revertLocalStatus: (snapshot) => {
        const map = new Map(snapshot.map(r => [r.id, r]))
        const reviews = get().reviews.map(r => map.has(r.id) ? map.get(r.id)! : r)
        set({ reviews, filteredReviews: applyFilters(reviews, get().filters) })
    },

    _enqueueAndTrackJob: async (affectedIds, endpoint, payload) => {
        // mark affected ids as syncing
        const syncing = new Set(get().syncingReviewIds)
        affectedIds.forEach(id => syncing.add(id))
        set({ syncingReviewIds: syncing, loading: true })
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Idempotency-Key': crypto.randomUUID(),
                },
                body: JSON.stringify(payload),
            })
            if (!res.ok && res.status !== 202) throw new Error('Request failed')
            const json = await res.json() as { jobId?: string }
            const jobId = json.jobId
            if (!jobId) return

            // Poll until completed or failed
            const poll = async (): Promise<void> => {
                for (let i = 0; i < 20; i++) {
                    const jr = await fetch(`/api/jobs/${jobId}`)
                    if (jr.ok) {
                        const j = await jr.json() as { job: { state: string } }
                        if (j.job.state === 'succeeded') return
                        if (j.job.state === 'failed') throw new Error('Job failed')
                    }
                    await new Promise(r => setTimeout(r, 500))
                }
            }
            await poll()
        } finally {
            // unmark affected ids
            const syncingAfter = new Set(get().syncingReviewIds)
            affectedIds.forEach(id => syncingAfter.delete(id))
            set({ syncingReviewIds: syncingAfter, loading: false })
        }
    },

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    fetchReviews: async () => {
        set({ loading: true, error: null })
        try {
            const pageSize = 100
            let page = 1
            let totalPages = 1
            const all: NormalizedReview[] = [] as unknown as NormalizedReview[]

            do {
                const res = await fetch(`/api/reviews/hostaway?page=${page}&pageSize=${pageSize}`)
                if (!res.ok) throw new Error('Failed to fetch reviews')
                const json = await res.json() as { success: boolean; data: NormalizedReview[]; pagination?: { totalPages?: number } }
                if (!json.success) throw new Error('Failed to fetch reviews')
                all.push(...json.data)
                totalPages = json.pagination?.totalPages || 1
                page += 1
            } while (page <= totalPages)

            get().setReviews(all)
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Unknown error' })
        } finally {
            set({ loading: false })
        }
    }
}))

function applyFilters(reviews: NormalizedReview[], filters: ReviewFilters): NormalizedReview[] {
    const q = (filters.query || '').trim().toLowerCase()
    return reviews.filter(review => {
        if (filters.property && review.property_name !== filters.property) return false
        if (filters.channel && review.channel !== filters.channel) return false
        if (filters.rating_min && review.rating < filters.rating_min) return false
        if (filters.rating_max && review.rating > filters.rating_max) return false
        if (filters.date_from && review.submitted_at < filters.date_from) return false
        if (filters.date_to && review.submitted_at > filters.date_to) return false
        if (filters.status && filters.status !== 'all' && review.status !== filters.status) return false
        if (q) {
            const hay = `${review.review_text} ${review.property_name} ${review.guest_name}`.toLowerCase()
            if (!hay.includes(q)) return false
        }

        return true
    })
}

function calculatePropertyStats(reviews: NormalizedReview[]): PropertyStats[] {
    const propertyMap = new Map<string, PropertyStats>()

    reviews.forEach(review => {
        const propertyName = review.property_name
        const existing = propertyMap.get(propertyName)

        if (existing) {
            existing.total_reviews++
            existing.average_rating = (existing.average_rating * (existing.total_reviews - 1) + review.rating) / existing.total_reviews

            if (review.status === 'pending') existing.pending_reviews++
            else if (review.status === 'approved') existing.approved_reviews++
            else if (review.status === 'rejected') existing.rejected_reviews++

            // Update category averages
            review.categories.forEach(cat => {
                const currentAvg = existing.category_averages[cat.category] || 0
                const currentCount = existing.category_averages[`${cat.category}_count`] || 0
                existing.category_averages[cat.category] = (currentAvg * currentCount + cat.rating) / (currentCount + 1)
                existing.category_averages[`${cat.category}_count`] = currentCount + 1
            })
        } else {
            const categoryAverages: Record<string, number> = {}
            review.categories.forEach(cat => {
                categoryAverages[cat.category] = cat.rating
                categoryAverages[`${cat.category}_count`] = 1
            })

            propertyMap.set(propertyName, {
                property_name: propertyName,
                total_reviews: 1,
                average_rating: review.rating,
                pending_reviews: review.status === 'pending' ? 1 : 0,
                approved_reviews: review.status === 'approved' ? 1 : 0,
                rejected_reviews: review.status === 'rejected' ? 1 : 0,
                category_averages: categoryAverages
            })
        }
    })

    return Array.from(propertyMap.values())
}
