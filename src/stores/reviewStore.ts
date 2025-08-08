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
        try {
            set({ loading: true })
            await fetch('/api/reviews/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: reviewId, status })
            })
            // Refetch from source of truth
            await get().fetchReviews()
        } finally {
            set({ loading: false })
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
        try {
            set({ loading: true })
            const selectedIds = Array.from(get().selectedReviews)
            await fetch('/api/reviews/bulk-update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds, status })
            })
            await get().fetchReviews()
            set({ selectedReviews: new Set() })
        } finally {
            set({ loading: false })
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
