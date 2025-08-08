'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Users } from 'lucide-react'
import { NormalizedReview } from '@/types/review'

export function YelpReviewsIntegration() {
    const [query, setQuery] = useState('')
    const [location, setLocation] = useState('London, UK')
    const [categories, setCategories] = useState('apartments')
    const [reviews, setReviews] = useState<NormalizedReview[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const searchReviews = async () => {
        if (!query.trim()) {
            setError('Please enter a search query')
            return
        }

        setLoading(true)
        setError('')

        try {
            const params = new URLSearchParams({
                query,
                location,
                ...(categories && { categories })
            })
            const response = await fetch(`/api/reviews/yelp/search?${params.toString()}`)
            const data = await response.json()

            if (data.success) {
                setReviews(data.data)
                setError('')
            } else {
                setError(data.error || 'Failed to fetch reviews')
                setReviews([])
            }
        } catch (err) {
            setError('Network error occurred')
            setReviews([])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            searchReviews()
        }
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
        ))
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Yelp Reviews Integration
                    </CardTitle>
                    <CardDescription>
                        Search for businesses and import their Yelp reviews
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search for businesses (e.g., Apartments, Hotels)"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                            <div className="w-48">
                                <Input
                                    placeholder="Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Categories (e.g., apartments, hotels, realestate)"
                                    value={categories}
                                    onChange={(e) => setCategories(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                            <Button
                                onClick={searchReviews}
                                disabled={loading}
                                className="px-6"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>

            {reviews.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Found {reviews.length} Reviews</CardTitle>
                        <CardDescription>
                            Reviews and business information from Yelp
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg">
                                                {review.property_name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center">
                                                    {renderStars(review.rating)}
                                                    <span className="ml-1 text-sm text-gray-600">
                                                        {review.rating}/5
                                                    </span>
                                                </div>
                                                <Badge variant="secondary">
                                                    {review.channel}
                                                </Badge>
                                                <Badge variant={review.status === 'approved' ? 'default' : 'outline'}>
                                                    {review.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Users className="h-4 w-4" />
                                            <span>{review.guest_name}</span>
                                            <span>•</span>
                                            <span>{new Date(review.submitted_at).toLocaleDateString()}</span>
                                        </div>

                                        <p className="text-gray-700 leading-relaxed">
                                            {review.review_text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {loading && (
                <Card>
                    <CardContent className="p-8">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <span className="ml-3">Searching Yelp for reviews...</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
