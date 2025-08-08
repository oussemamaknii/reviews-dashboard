"use client"

import { useReviewStore } from '@/stores/reviewStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Star, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatRating } from '@/lib/utils'

export function PropertyStats() {
    const { properties, filteredReviews } = useReviewStore()

    const totalReviews = filteredReviews.length
    const pendingReviews = filteredReviews.filter(r => r.status === 'pending').length
    const approvedReviews = filteredReviews.filter(r => r.status === 'approved').length
    const rejectedReviews = filteredReviews.filter(r => r.status === 'rejected').length

    const overallRating = totalReviews > 0
        ? filteredReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0

    const topProperties = [...properties]
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 5)

    const needsAttention = properties.filter(p =>
        p.average_rating < 7 || p.pending_reviews > 5
    )

    return (
        <div className="grid gap-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReviews}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {properties.length} properties
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-1">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            {formatRating(overallRating)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Overall performance
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingReviews}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting approval
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved Reviews</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{approvedReviews}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalReviews > 0 ? Math.round((approvedReviews / totalReviews) * 100) : 0}% approval rate
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performing Properties */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Properties</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topProperties.map((property, index) => (
                                <div key={property.property_name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {property.property_name.split(' - ')[0]}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {property.total_reviews} reviews
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-medium">{formatRating(property.average_rating)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Properties Needing Attention */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            Needs Attention
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {needsAttention.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                All properties are performing well! 🎉
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {needsAttention.map((property) => (
                                    <div key={property.property_name} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-sm">
                                                {property.property_name.split(' - ')[0]}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">{formatRating(property.average_rating)}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {property.average_rating < 7 && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Low Rating
                                                </Badge>
                                            )}
                                            {property.pending_reviews > 5 && (
                                                <Badge variant="outline" className="text-xs">
                                                    {property.pending_reviews} Pending
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Review Status Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Review Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    Approved
                                </span>
                                <span className="font-medium">{approvedReviews} ({totalReviews > 0 ? Math.round((approvedReviews / totalReviews) * 100) : 0}%)</span>
                            </div>
                            <Progress value={totalReviews > 0 ? (approvedReviews / totalReviews) * 100 : 0} className="h-2" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    Pending
                                </span>
                                <span className="font-medium">{pendingReviews} ({totalReviews > 0 ? Math.round((pendingReviews / totalReviews) * 100) : 0}%)</span>
                            </div>
                            <Progress value={totalReviews > 0 ? (pendingReviews / totalReviews) * 100 : 0} className="h-2" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    Rejected
                                </span>
                                <span className="font-medium">{rejectedReviews} ({totalReviews > 0 ? Math.round((rejectedReviews / totalReviews) * 100) : 0}%)</span>
                            </div>
                            <Progress value={totalReviews > 0 ? (rejectedReviews / totalReviews) * 100 : 0} className="h-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
