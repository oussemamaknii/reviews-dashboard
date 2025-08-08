import { HostawayApiResponse, HostawayReview, NormalizedReview } from '@/types/review'
import mockHostawayReviews from '@/data/hostaway_mock_reviews.json'
import properties from '@/data/properties.json'

const HOSTAWAY_API_BASE = process.env.HOSTAWAY_API_BASE || ''
const HOSTAWAY_ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID || ''
const API_KEY = process.env.HOSTAWAY_API_KEY || ''

export class HostawayService {
    private async makeRequest<T>(endpoint: string): Promise<T> {
        try {
            const response = await fetch(`${HOSTAWAY_API_BASE}${endpoint}`, {
                headers: {
                    'X-Hostaway-API-Key': API_KEY,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`Hostaway API error: ${response.status}`)
            }

            return (await response.json()) as T
        } catch (error) {
            console.error('Hostaway API request failed:', error)
            throw error
        }
    }

    async getReviews(): Promise<HostawayReview[]> {
        try {
            const response = await this.makeRequest<HostawayApiResponse>(`/reviews?accountId=${HOSTAWAY_ACCOUNT_ID}`)

            if (response.status === 'success') {
                return response.result
            } else {
                throw new Error('Hostaway API returned error status')
            }
        } catch (error) {
            console.warn('Using mock data due to API error:', error)
            return this.getMockReviews()
        }
    }

    private getMockReviews(): HostawayReview[] {
        const reviews = mockHostawayReviews as unknown as HostawayReview[]
        const fourIds = new Set<string>(
            (properties as Array<{ id: string; name: string }>).map(p => p.name)
        )

        const ensureForFour = reviews.filter(r => fourIds.has(r.listingName))
        if (ensureForFour.length >= 8) return reviews

        // If some of the 4 properties have no reviews in the JSON, synthesize minimal entries
        const byName = new Set(ensureForFour.map(r => r.listingName))
        const missing = (properties as Array<{ name: string }>).filter(p => !byName.has(p.name))

        const now = new Date()
        const synthesized: HostawayReview[] = missing.map((p, idx) => ({
            id: 900000 + idx,
            type: 'guest-to-host',
            status: 'published',
            rating: 8.2,
            publicReview: 'Great stay and very convenient location.',
            reviewCategory: [
                { category: 'cleanliness', rating: 8 },
                { category: 'communication', rating: 9 },
                { category: 'location', rating: 8 },
                { category: 'value', rating: 8 }
            ],
            submittedAt: now.toISOString().replace('T', ' ').slice(0, 19),
            guestName: 'Auto Guest',
            listingName: p.name,
        }))

        return [...reviews, ...synthesized]
    }

    normalizeReview(hostawayReview: HostawayReview): NormalizedReview {
        return {
            id: `hostaway_${hostawayReview.id}`,
            hostaway_id: hostawayReview.id,
            property_name: hostawayReview.listingName,
            guest_name: hostawayReview.guestName,
            rating: hostawayReview.rating || this.calculateAverageFromCategories(hostawayReview.reviewCategory),
            review_text: hostawayReview.publicReview,
            categories: hostawayReview.reviewCategory,
            channel: 'hostaway',
            submitted_at: new Date(hostawayReview.submittedAt),
            status: 'pending',
            is_public: false,
            created_at: new Date(),
            updated_at: new Date()
        }
    }

    private calculateAverageFromCategories(categories: { category: string; rating: number }[]): number {
        if (categories.length === 0) return 0
        const sum = categories.reduce((acc, cat) => acc + cat.rating, 0)
        return sum / categories.length
    }
}

export const hostawayService = new HostawayService()
