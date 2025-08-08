"use client"

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, User, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { NormalizedReview } from '@/types/review'
import { formatDate } from '@/lib/utils'

interface ReviewsSectionProps {
    propertyName: string
}

interface ReviewsData {
    reviews: NormalizedReview[]
    statistics: {
        total_reviews: number
        average_rating: number
        category_averages: Record<string, number>
        rating_distribution: Array<{
            rating: number
            count: number
            percentage: number
        }>
    }
}

export function ReviewsSection({ propertyName }: ReviewsSectionProps) {
    const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [showAllReviews, setShowAllReviews] = useState(false)

    useEffect(() => {
        fetchReviews()
    }, [propertyName])

    const fetchReviews = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/reviews/public/${encodeURIComponent(propertyName)}`)
            const data = await response.json()

            if (data.success) {
                setReviewsData(data.data)
            }
        } catch (error) {
            console.error('Error fetching reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-12">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!reviewsData || reviewsData.reviews.length === 0) {
        return (
            <div className="container mx-auto px-6 py-12">
                <Card>
                    <CardContent className="text-center py-12">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                        <p className="text-gray-600">Be the first to leave a review for this property!</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { reviews, statistics } = reviewsData
    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 6)

    const getCategoryDisplayName = (category: string) => {
        const categoryNames: Record<string, string> = {
            'cleanliness': 'Cleanliness',
            'communication': 'Communication',
            'location': 'Location',
            'value': 'Value for Money',
            'respect_house_rules': 'House Rules',
            'check_in': 'Check-in Experience'
        }
        return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)
    }

    return (
        <div className="bg-gray-50 py-16">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Guest Reviews</h2>
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-6 w-6 ${star <= statistics.average_rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                                {statistics.average_rating}
                            </span>
                        </div>
                        <span className="text-gray-600 text-lg">
                            Based on {statistics.total_reviews} {statistics.total_reviews === 1 ? 'review' : 'reviews'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Reviews List */}
                    <div className="lg:col-span-2">
                        <div className="space-y-6">
                            {displayedReviews.map((review) => (
                                <Card key={review.id} className="bg-white">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {review.guest_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{review.guest_name}</h4>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{formatDate(review.submitted_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold text-gray-900">
                                                    {review.rating.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            {review.review_text}
                                        </p>

                                        {/* Category Ratings */}
                                        {review.categories.length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {review.categories.map((category, index) => (
                                                    <div key={index} className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">
                                                            {getCategoryDisplayName(category.category)}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-medium">{category.rating}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Review Actions */}
                                        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                                                <ThumbsUp className="h-4 w-4 mr-1" />
                                                Helpful
                                            </Button>
                                            <Badge variant="outline" className="text-xs">
                                                {review.channel}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Show More Button */}
                        {reviews.length > 6 && (
                            <div className="text-center mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAllReviews(!showAllReviews)}
                                    className="px-8"
                                >
                                    {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Reviews Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-6">
                            {/* Overall Rating */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Overall Rating</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center mb-6">
                                        <div className="text-4xl font-bold text-gray-900 mb-2">
                                            {statistics.average_rating}
                                        </div>
                                        <div className="flex items-center justify-center mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-5 w-5 ${star <= statistics.average_rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {statistics.total_reviews} total reviews
                                        </p>
                                    </div>

                                    {/* Rating Distribution */}
                                    <div className="space-y-2">
                                        {statistics.rating_distribution.reverse().map((item) => (
                                            <div key={item.rating} className="flex items-center gap-2">
                                                <span className="text-sm w-6">{item.rating}</span>
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                <Progress value={item.percentage} className="flex-1 h-2" />
                                                <span className="text-sm text-gray-600 w-8">
                                                    {item.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Category Ratings */}
                            {Object.keys(statistics.category_averages).length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Category Ratings</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {Object.entries(statistics.category_averages).map(([category, rating]) => (
                                                <div key={category} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-700">
                                                        {getCategoryDisplayName(category)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={rating * 10} className="w-16 h-2" />
                                                        <span className="text-sm font-medium w-8">
                                                            {rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
