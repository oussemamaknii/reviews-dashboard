import { HostawayApiResponse, HostawayReview, NormalizedReview } from '@/types/review'

const HOSTAWAY_API_BASE = process.env.HOSTAWAY_API_BASE || ''
const HOSTAWAY_ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID || ''
const API_KEY = process.env.HOSTAWAY_API_KEY || ''

export class HostawayService {
    private async makeRequest(endpoint: string): Promise<any> {
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

            return await response.json()
        } catch (error) {
            console.error('Hostaway API request failed:', error)
            throw error
        }
    }

    async getReviews(): Promise<HostawayReview[]> {
        try {
            const response: HostawayApiResponse = await this.makeRequest(`/reviews?accountId=${HOSTAWAY_ACCOUNT_ID}`)

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
        return [
            {
                id: 7453,
                type: "guest-to-host",
                status: "published",
                rating: 9.2,
                publicReview: "Amazing stay at this beautiful property! The location was perfect and the host was incredibly helpful. Would definitely recommend to anyone visiting the area.",
                reviewCategory: [
                    { category: "cleanliness", rating: 10 },
                    { category: "communication", rating: 9 },
                    { category: "respect_house_rules", rating: 9 }
                ],
                submittedAt: "2024-01-15 14:30:22",
                guestName: "Sarah Johnson",
                listingName: "2B N1 A - 29 Shoreditch Heights"
            },
            {
                id: 7454,
                type: "guest-to-host",
                status: "published",
                rating: 8.7,
                publicReview: "Great property with excellent amenities. The apartment was clean and well-maintained. Minor issue with WiFi but host resolved it quickly.",
                reviewCategory: [
                    { category: "cleanliness", rating: 9 },
                    { category: "communication", rating: 10 },
                    { category: "location", rating: 8 },
                    { category: "value", rating: 8 }
                ],
                submittedAt: "2024-01-12 09:15:33",
                guestName: "Michael Chen",
                listingName: "1B E1 B - 15 Canary Wharf Tower"
            },
            {
                id: 7455,
                type: "guest-to-host",
                status: "published",
                rating: 6.5,
                publicReview: "The location is good but the apartment needs some maintenance. The heating wasn't working properly during our stay.",
                reviewCategory: [
                    { category: "cleanliness", rating: 7 },
                    { category: "communication", rating: 8 },
                    { category: "location", rating: 9 },
                    { category: "value", rating: 5 }
                ],
                submittedAt: "2024-01-10 18:45:12",
                guestName: "Emma Thompson",
                listingName: "Studio W2 C - 42 Paddington Central"
            },
            {
                id: 7456,
                type: "guest-to-host",
                status: "published",
                rating: 9.8,
                publicReview: "Absolutely perfect! Everything was exactly as described. The property is modern, clean, and in an excellent location. Host communication was outstanding.",
                reviewCategory: [
                    { category: "cleanliness", rating: 10 },
                    { category: "communication", rating: 10 },
                    { category: "location", rating: 10 },
                    { category: "value", rating: 9 }
                ],
                submittedAt: "2024-01-08 16:20:45",
                guestName: "David Wilson",
                listingName: "2B SW1 D - 88 Victoria Gardens"
            },
            {
                id: 7457,
                type: "guest-to-host",
                status: "published",
                rating: 7.3,
                publicReview: "Good stay overall. The apartment was spacious and well-located. Could use some updates to the furniture and kitchen equipment.",
                reviewCategory: [
                    { category: "cleanliness", rating: 8 },
                    { category: "communication", rating: 7 },
                    { category: "location", rating: 9 },
                    { category: "value", rating: 6 }
                ],
                submittedAt: "2024-01-05 11:30:18",
                guestName: "Lisa Rodriguez",
                listingName: "2B N1 A - 29 Shoreditch Heights"
            }
        ]
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
