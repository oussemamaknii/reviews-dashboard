import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import properties from '@/data/properties.json'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ property: string }> }
) {
    try {
        const { property } = await params
        const propertyName = decodeURIComponent(property)
        // Resolve by id or name
        const prop = (properties as Array<{ id: string; name: string }>).find(
            p => p.id === propertyName || p.name.toLowerCase() === propertyName.toLowerCase()
        )
        const effectiveName = prop ? prop.name : propertyName

        const url = new URL(request.url)
        const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
        const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') || '20')))
        const skip = (page - 1) * pageSize

        const prisma = new PrismaClient()
        const where = effectiveName.toLowerCase() === 'all' ? {} : { property: { name: effectiveName } }
        const [total, rows] = await Promise.all([
            prisma.review.count({ where: { ...where, status: 'approved' } }),
            prisma.review.findMany({
            include: { categories: true, property: true },
                where: { ...where, status: 'approved' },
                orderBy: { submittedAt: 'desc' },
                skip,
                take: pageSize
            })
        ])
        const normalizedReviews = rows.map(r => ({
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
        }))

        // Calculate aggregate statistics
        const totalReviews = total
        const averageRating = totalReviews > 0
            ? normalizedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0

        // Calculate category averages
        const categoryStats: Record<string, { total: number; count: number }> = {}

        normalizedReviews.forEach(review => {
            review.categories.forEach(category => {
                if (!categoryStats[category.category]) {
                    categoryStats[category.category] = { total: 0, count: 0 }
                }
                categoryStats[category.category].total += category.rating
                categoryStats[category.category].count += 1
            })
        })

        const categoryAverages = Object.entries(categoryStats).reduce((acc, [category, stats]) => {
            acc[category] = stats.total / stats.count
            return acc
        }, {} as Record<string, number>)

        // Rating distribution
        const ratingDistribution = [1, 2, 3, 4, 5].map(rating => {
            const count = normalizedReviews.filter(review => Math.floor(review.rating / 2) + 1 === rating).length
            return {
                rating,
                count,
                percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                reviews: normalizedReviews,
                statistics: {
                    total_reviews: totalReviews,
                    average_rating: Number(averageRating.toFixed(1)),
                    category_averages: categoryAverages,
                    rating_distribution: ratingDistribution
                },
                property_name: effectiveName,
                pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
            }
        })
    } catch (error) {
        console.error('Error fetching public reviews:', error)

        return NextResponse.json({
            success: false,
            error: 'Failed to fetch reviews',
            data: {
                reviews: [],
                statistics: {
                    total_reviews: 0,
                    average_rating: 0,
                    category_averages: {},
                    rating_distribution: []
                }
            }
        }, { status: 500 })
    }
}
