import { NextResponse } from 'next/server'
import { hostawayService } from '@/services/hostaway'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ property: string }> }
) {
    try {
        const { property } = await params
        const propertyName = decodeURIComponent(property)

        // Get all reviews from Hostaway
        const hostawayReviews = await hostawayService.getReviews()

        // Normalize and filter for the specific property and approved status
        const normalizedReviews = hostawayReviews
            .map(review => hostawayService.normalizeReview(review))
            .filter(review => {
                // For demo purposes, we'll consider all reviews as approved
                // In production, you'd filter by review.status === 'approved'
                return review.property_name.toLowerCase().includes(propertyName.toLowerCase()) ||
                    propertyName.toLowerCase() === 'all'
            })
            .map(review => ({
                ...review,
                status: 'approved', // Demo: mark all as approved for public display
                is_public: true
            }))
            .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())

        // Calculate aggregate statistics
        const totalReviews = normalizedReviews.length
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
                reviews: normalizedReviews.slice(0, 20), // Limit to 20 most recent
                statistics: {
                    total_reviews: totalReviews,
                    average_rating: Number(averageRating.toFixed(1)),
                    category_averages: categoryAverages,
                    rating_distribution: ratingDistribution
                },
                property_name: propertyName
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
