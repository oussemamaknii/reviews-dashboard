import { NextResponse } from 'next/server'
import { hostawayService } from '@/services/hostaway'
import { NormalizedReview } from '@/types/review'

export async function GET() {
    try {
        const hostawayReviews = await hostawayService.getReviews()

        const normalizedReviews: NormalizedReview[] = hostawayReviews.map(review =>
            hostawayService.normalizeReview(review)
        )

        return NextResponse.json({
            success: true,
            data: normalizedReviews,
            count: normalizedReviews.length,
            source: 'hostaway'
        })
    } catch (error) {
        console.error('Error fetching Hostaway reviews:', error)

        return NextResponse.json({
            success: false,
            error: 'Failed to fetch reviews from Hostaway',
            data: [],
            count: 0
        }, { status: 500 })
    }
}
