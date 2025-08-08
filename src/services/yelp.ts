import { NormalizedReview } from '@/types/review'

const YELP_API_BASE = 'https://api.yelp.com/v3'
const API_KEY = process.env.YELP_API_KEY || ''

const getHeaders = () => ({
    'accept': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
})

interface YelpBusiness {
    id: string
    name: string
    rating: number
    review_count: number
    location: {
        address1?: string
        city?: string
        state?: string
        country?: string
        display_address: string[]
    }
    phone?: string
    url: string
}

interface YelpSearchResponse {
    businesses: YelpBusiness[]
    total: number
}

interface YelpReview {
    id: string
    rating: number
    text: string
    time_created: string
    user: {
        id: string
        name: string
        image_url?: string
    }
}

interface YelpReviewsResponse {
    reviews: YelpReview[]
    total: number
}

export class YelpService {
    private async makeRequest<T>(endpoint: string): Promise<T> {
        if (!API_KEY) {
            throw new Error('YELP_API_KEY not configured')
        }

        const url = `${YELP_API_BASE}${endpoint}`
        const response = await fetch(url, {
            headers: getHeaders(),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Yelp API error: ${response.status} - ${errorText}`)
        }

        return (await response.json()) as T
    }

    /**
 * Search for businesses by query
 */
    async searchBusinesses(query: string, location: string = 'London, UK', categories?: string): Promise<YelpBusiness[]> {
        try {
            // Build query parameters
            const params = new URLSearchParams({
                term: query,
                location: location,
                sort_by: 'best_match',
                limit: '20'
            })

            // Add categories if provided
            if (categories) {
                params.append('categories', categories)
            }

            const data: YelpSearchResponse = await this.makeRequest(
                `/businesses/search?${params.toString()}`
            )

            return data.businesses || []
        } catch (error) {
            console.error('Yelp search failed:', error)
            return []
        }
    }

    /**
     * Get reviews for a specific business
     */
    async getBusinessReviews(businessId: string): Promise<YelpReview[]> {
        try {
            const data: YelpReviewsResponse = await this.makeRequest(
                `/businesses/${businessId}/reviews?limit=10&sort_by=newest`
            )

            return data.reviews || []
        } catch (error) {
            console.error(`Yelp reviews fetch failed for ${businessId}:`, error)
            return []
        }
    }

    /**
 * Get reviews by search query - combines business search + review fetching
 */
    async getReviewsByQuery(query: string, location: string = 'London, UK', categories?: string): Promise<NormalizedReview[]> {
        try {
            // First, search for businesses
            const businesses = await this.searchBusinesses(query, location, categories)

            if (businesses.length === 0) {
                return []
            }

            const reviews: NormalizedReview[] = []
            const now = new Date()

            // For each business, get reviews
            for (const business of businesses.slice(0, 5)) { // Limit to first 5 businesses to avoid rate limits
                try {
                    const businessReviews = await this.getBusinessReviews(business.id)

                    if (businessReviews.length > 0) {
                        // Convert Yelp reviews to normalized format
                        for (const review of businessReviews) {
                            reviews.push({
                                id: `yelp_${review.id}`,
                                yelp_id: review.id,
                                property_name: business.name,
                                guest_name: review.user.name,
                                rating: review.rating,
                                review_text: review.text,
                                categories: [], // Could map business categories if needed
                                channel: 'yelp',
                                submitted_at: new Date(review.time_created),
                                status: 'pending', // Reviews need approval
                                is_public: false,
                                created_at: now,
                                updated_at: now
                            })
                        }
                    } else {
                        // No reviews, add business info as fallback
                        reviews.push({
                            id: `yelp_business_${business.id}`,
                            yelp_id: business.id,
                            property_name: business.name,
                            guest_name: 'Yelp Business Info',
                            rating: business.rating,
                            review_text: `${business.name} - ${business.location.display_address.join(', ')} | ${business.review_count} reviews on Yelp`,
                            categories: [],
                            channel: 'yelp',
                            submitted_at: now,
                            status: 'approved', // Business info is auto-approved
                            is_public: true,
                            created_at: now,
                            updated_at: now
                        })
                    }
                } catch (reviewError: any) {
                    console.warn(`Failed to fetch reviews for ${business.name}, using business info:`, reviewError.message)

                    // Fallback to business info
                    reviews.push({
                        id: `yelp_business_${business.id}`,
                        yelp_id: business.id,
                        property_name: business.name,
                        guest_name: 'Yelp Business Info',
                        rating: business.rating,
                        review_text: `${business.name} - ${business.location.display_address.join(', ')} | ${business.review_count} reviews on Yelp`,
                        categories: [],
                        channel: 'yelp',
                        submitted_at: now,
                        status: 'approved',
                        is_public: true,
                        created_at: now,
                        updated_at: now
                    })
                }
            }

            return reviews
        } catch (error) {
            console.error('Yelp getReviewsByQuery failed:', error)
            return []
        }
    }
}

export const yelpService = new YelpService()
