export interface ReviewCategory {
    category: string
    rating: number
}

export interface HostawayReview {
    id: number
    type: 'host-to-guest' | 'guest-to-host'
    status: 'published' | 'pending' | 'draft'
    rating: number | null
    publicReview: string
    reviewCategory: ReviewCategory[]
    submittedAt: string
    guestName: string
    listingName: string
}

export interface HostawayApiResponse {
    status: 'success' | 'error'
    result: HostawayReview[]
}

export interface NormalizedReview {
    id: string
    hostaway_id?: number
    google_id?: string
    foursquare_id?: string
    yelp_id?: string
    property_name: string
    guest_name: string
    rating: number
    review_text: string
    categories: ReviewCategory[]
    channel: 'hostaway' | 'foursquare' | 'airbnb' | 'booking' | 'yelp'
    submitted_at: Date
    status: 'pending' | 'approved' | 'rejected'
    is_public: boolean
    created_at: Date
    updated_at: Date
}

export interface ReviewFilters {
    property?: string
    channel?: string
    rating_min?: number
    rating_max?: number
    date_from?: Date
    date_to?: Date
    status?: 'pending' | 'approved' | 'rejected' | 'all'
}

export interface PropertyStats {
    property_name: string
    total_reviews: number
    average_rating: number
    pending_reviews: number
    approved_reviews: number
    rejected_reviews: number
    category_averages: Record<string, number>
}

export interface DashboardData {
    reviews: NormalizedReview[]
    properties: PropertyStats[]
    total_count: number
    filters: ReviewFilters
}
