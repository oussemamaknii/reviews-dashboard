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

    updateReviewStatus: (reviewId, status) => {
        const reviews = get().reviews.map(review =>
            review.id === reviewId
                ? { ...review, status, updated_at: new Date() }
                : review
        )
        const properties = calculatePropertyStats(reviews)
        const filteredReviews = applyFilters(reviews, get().filters)
        set({ reviews, properties, filteredReviews })
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

    bulkUpdateStatus: (status) => {
        const selectedIds = get().selectedReviews
        const reviews = get().reviews.map(review =>
            selectedIds.has(review.id)
                ? { ...review, status, updated_at: new Date() }
                : review
        )
        const properties = calculatePropertyStats(reviews)
        const filteredReviews = applyFilters(reviews, get().filters)
        set({ reviews, properties, filteredReviews, selectedReviews: new Set() })
    },

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    fetchReviews: async () => {
        set({ loading: true, error: null })
        try {
            const response = await fetch('/api/reviews/hostaway')
            if (!response.ok) throw new Error('Failed to fetch reviews')

            const data = await response.json()
            if (data.success) {
                get().setReviews(data.data)
            } else {
                throw new Error(data.error || 'Unknown error')
            }
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Unknown error' })
        } finally {
            set({ loading: false })
        }
    }
}))

function applyFilters(reviews: NormalizedReview[], filters: ReviewFilters): NormalizedReview[] {
    return reviews.filter(review => {
        if (filters.property && review.property_name !== filters.property) return false
        if (filters.channel && review.channel !== filters.channel) return false
        if (filters.rating_min && review.rating < filters.rating_min) return false
        if (filters.rating_max && review.rating > filters.rating_max) return false
        if (filters.date_from && review.submitted_at < filters.date_from) return false
        if (filters.date_to && review.submitted_at > filters.date_to) return false
        if (filters.status && filters.status !== 'all' && review.status !== filters.status) return false

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
