import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: Request) {
    try {
        const url = new URL(request.url)
        const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
        const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') || '20')))
        const skip = (page - 1) * pageSize

        const prisma = new PrismaClient()
        const [total, reviews] = await Promise.all([
            prisma.review.count(),
            prisma.review.findMany({
                include: { categories: true, property: true },
                orderBy: { submittedAt: 'desc' },
                skip,
                take: pageSize
            })
        ])

        return NextResponse.json({
            success: true,
            data: reviews.map(r => ({
                id: r.id,
                property_name: r.property.name,
                guest_name: r.guestName,
                rating: r.rating,
                review_text: r.reviewText,
                categories: r.categories.map(c => ({ category: c.category, rating: c.rating })),
                channel: r.channel as 'hostaway' | 'foursquare' | 'airbnb' | 'booking' | 'yelp',
                submitted_at: r.submittedAt,
                status: r.status as 'pending' | 'approved' | 'rejected',
                is_public: r.isPublic,
                created_at: r.createdAt,
                updated_at: r.updatedAt
            })),
            count: reviews.length,
            pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
            source: 'database'
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
