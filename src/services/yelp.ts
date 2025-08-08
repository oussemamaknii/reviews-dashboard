import { NormalizedReview } from '@/types/review'

const YELP_API_BASE = 'https://api.yelp.com/v3'
const YELP_AI_BASE = 'https://api.yelp.com/ai/chat/v2'
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

type YelpReviewHighlightRaw =
    | { text?: string; text_excerpts?: string[]; rating?: number; time_created?: string; user?: { name?: string } }
    | { highlight?: string; snippets?: string[]; rating?: number; time_created?: string; user?: { name?: string } }

interface YelpReviewHighlightsResponse {
    review_highlights?: YelpReviewHighlightRaw[]
    highlights?: YelpReviewHighlightRaw[]
}

type AiContentChunk = { text?: string; type?: string }
type AiStructuredOutput = { text?: string; content?: AiContentChunk[] }
type AiResponse = { output?: AiStructuredOutput | string; content?: AiContentChunk[] }

export class YelpService {
    private async makeAiRequest<T>(body: unknown): Promise<T> {
        if (!API_KEY) {
            throw new Error('YELP_API_KEY not configured')
        }

        const response = await fetch(YELP_AI_BASE, {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Yelp AI error: ${response.status} - ${errorText}`)
        }

        return (await response.json()) as T
    }

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
    async getBusinessReviews(businessId: string, limit: number = 20, sortBy: 'yelp_sort' | 'newest' = 'yelp_sort'): Promise<YelpReview[]> {
        try {
            const data: YelpReviewsResponse = await this.makeRequest(
                `/businesses/${businessId}/reviews?limit=${limit}&sort_by=${sortBy}`
            )

            return data.reviews || []
        } catch (error) {
            console.error(`Yelp reviews fetch failed for ${businessId}:`, error)
            return []
        }
    }

    /**
     * Get business details
     */
    async getBusinessDetails(businessId: string): Promise<YelpBusiness & { image_url?: string }> {
        return await this.makeRequest(`/businesses/${businessId}`)
    }

    /**
     * Get review highlights for a business and map them to YelpReview-like objects
     */
    async getBusinessReviewHighlights(businessId: string, count: number = 3): Promise<YelpReview[]> {
        try {
            const data: YelpReviewHighlightsResponse = await this.makeRequest(
                `/businesses/${businessId}/review_highlights?count=${count}`
            )

            const raws: YelpReviewHighlightRaw[] = data.review_highlights || data.highlights || []
            const reviews: YelpReview[] = raws.slice(0, count).map((h, idx) => {
                const candidateA = 'text' in h ? h.text : undefined
                const candidateB = 'text_excerpts' in h && Array.isArray(h.text_excerpts) ? h.text_excerpts.join(' ') : undefined
                const candidateC = 'highlight' in h ? h.highlight : undefined
                const candidateD = 'snippets' in h && Array.isArray(h.snippets) ? h.snippets.join(' ') : undefined
                const text = candidateA || candidateB || candidateC || candidateD || 'Review highlight'
                const userName = (('user' in h && typeof h.user?.name === 'string') ? h.user?.name : undefined) || 'Yelp Highlight'
                const time = ('time_created' in h && typeof h.time_created === 'string') ? h.time_created : new Date().toISOString()
                const rating = (('rating' in h) && typeof (h as { rating?: number }).rating === 'number') ? (h as { rating?: number }).rating as number : 0
                return {
                    id: `hl_${idx}`,
                    rating,
                    text,
                    time_created: time,
                    user: { id: `hl_user_${idx}`, name: userName },
                }
            })

            return reviews
        } catch (error) {
            console.error(`Yelp review_highlights fetch failed for ${businessId}:`, error)
            return []
        }
    }

    /**
     * Ask Yelp AI to summarize businesses and include minimal review data per business.
     */
    async aiSummarizeBusinesses(params: { ids: string[]; location?: string; maxReviewsPerBusiness?: number }): Promise<Array<{
        id: string
        name?: string
        review_count?: number
        top_reviews?: Array<{ rating?: number; text?: string; time_created?: string; user_name?: string }>
    }>> {
        const { ids, location, maxReviewsPerBusiness = 3 } = params

        if (!ids.length) return []

        const prompt = `For each of these Yelp business IDs: ${ids.join(', ')}${location ? ` in ${location}` : ''}, return ONLY JSON array of objects with fields: id, name, review_count, and top_reviews (array of at most ${maxReviewsPerBusiness} items; each with rating, text, time_created, user_name). Example: [{"id":"abc","name":"X","review_count":10,"top_reviews":[{"rating":5,"text":"...","time_created":"2024-01-01","user_name":"John"}]}]`;

        const json = await this.makeAiRequest<AiResponse>({ query: prompt })
        const text: string = (() => {
            const output = json?.output
            if (typeof output === 'string') return output
            if (output && typeof output.text === 'string') return output.text
            const contentArr: AiContentChunk[] | undefined = output?.content || json?.content
            const found = Array.isArray(contentArr) ? contentArr.find(c => typeof c.text === 'string' && !!c.text) : undefined
            return found?.text || ''
        })()

        try {
            const parsed = JSON.parse(text)
            if (Array.isArray(parsed)) return parsed
            return []
        } catch {
            return []
        }
    }

    /**
     * Find rental businesses with full info and reviews via Yelp AI.
     * The AI is instructed to only include businesses whose data is accessible via Yelp Fusion v3 endpoints.
     */
    async aiFindRentalBusinessesWithData(params: {
        location: string
        maxBusinesses?: number
        minReviews?: number
        maxReviewsPerBusiness?: number
    }): Promise<Array<{
        id: string
        alias?: string
        name: string
        rating?: number
        review_count?: number
        url?: string
        image_url?: string
        categories?: Array<{ alias?: string; title?: string }>
        location?: { display_address?: string[] }
        coordinates?: { latitude?: number; longitude?: number }
        phone?: string
        reviews?: Array<{ rating?: number; text?: string; time_created?: string; user_name?: string }>
    }>> {
        const { location, maxBusinesses = 20, minReviews = 2, maxReviewsPerBusiness = 3 } = params

        const prompt = `Return ONLY JSON array of up to ${maxBusinesses} businesses in ${location} that offer apartment or real-estate renting (short-term or long-term), each with at least ${minReviews} reviews on Yelp, AND whose data is accessible via Yelp Fusion v3 (business details and /v3/businesses/{id}/reviews). For each business include fields: id, alias, name, rating, review_count, url, image_url, categories (array of {alias,title}), location (with display_address array), coordinates (latitude, longitude), phone, and reviews (array of at most ${maxReviewsPerBusiness} items with rating, text, time_created, user_name). Example: [{"id":"abc","alias":"x","name":"Biz","rating":4.5,"review_count":12,"url":"...","image_url":"...","categories":[{"alias":"apartments","title":"Apartments"}],"location":{"display_address":["123 St","City"]},"coordinates":{"latitude":51.5,"longitude":-0.12},"phone":"+44...","reviews":[{"rating":5,"text":"Great","time_created":"2024-01-01","user_name":"John"}]}]`;

        const json = await this.makeAiRequest<AiResponse>({ query: prompt })
        const text: string = (() => {
            const output = json?.output
            if (typeof output === 'string') return output
            if (output && typeof output.text === 'string') return output.text
            const contentArr: AiContentChunk[] | undefined = output?.content || json?.content
            const found = Array.isArray(contentArr) ? contentArr.find(c => typeof c.text === 'string' && !!c.text) : undefined
            return found?.text || ''
        })()

        try {
            const parsed = JSON.parse(text)
            if (Array.isArray(parsed)) return parsed
            return []
        } catch {
            return []
        }
    }

    /**
     * Use Yelp Fusion AI to return a JSON list of business ids matching a rental theme.
     */
    async aiListRentalBusinessIds(params: { location: string; maxIds?: number }): Promise<string[]> {
        const { location, maxIds = 20 } = params

        const prompt = `Return ONLY JSON with an array field business_ids containing Yelp business IDs of businesses in ${location} that offer apartment or real estate renting (short-term or long-term) AND have at least 2 reviews on Yelp. Max ${maxIds} IDs. Example: {"business_ids": ["abc", "def"]}.`

        try {
            const json = await this.makeAiRequest<AiResponse>({ query: prompt })

            // Attempt to extract text from multiple possible shapes
            const text: string = (() => {
                const output = json?.output
                if (typeof output === 'string') return output
                if (output && typeof output.text === 'string') return output.text
                const contentArr: AiContentChunk[] | undefined = output?.content || json?.content
                const found = Array.isArray(contentArr) ? contentArr.find(c => typeof c.text === 'string' && !!c.text) : undefined
                return found?.text || ''
            })()

            const parsed = (() => {
                try { return JSON.parse(text) } catch { return {} }
            })() as { business_ids?: string[] }

            if (Array.isArray(parsed.business_ids) && parsed.business_ids.length > 0) {
                return parsed.business_ids.slice(0, maxIds)
            }
        } catch (e) {
            // fall through to non-AI fallback
            console.warn('Yelp AI query failed, falling back to category search:', e instanceof Error ? e.message : e)
        }

        // Fallback: category-based search
        try {
            const categories = 'apartments,realestateagents,propertymgmt'
            const businesses = await this.searchBusinesses('rental', location, categories)
            const filtered = businesses.filter(b => (b.review_count ?? 0) >= 2)
            return filtered.map(b => b.id).slice(0, maxIds)
        } catch {
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
                } catch (reviewError: unknown) {
                    console.warn(`Failed to fetch reviews for ${business.name}, using business info:`, (reviewError instanceof Error ? reviewError.message : String(reviewError)))

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
