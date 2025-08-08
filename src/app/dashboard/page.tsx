"use client"

import { useEffect } from 'react'
import { useReviewStore } from '@/stores/reviewStore'
import { ReviewFilters } from '@/components/dashboard/ReviewFilters'
import { ReviewTable } from '@/components/dashboard/ReviewTable'
import { PropertyStats } from '@/components/dashboard/PropertyStats'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
    const { fetchReviews, loading, error, filteredReviews } = useReviewStore()

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews])

    const handleExport = () => {
        const csvContent = [
            ['Date', 'Property', 'Guest', 'Rating', 'Channel', 'Status', 'Review'].join(','),
            ...filteredReviews.map(review => [
                new Date(review.submitted_at).toLocaleDateString(),
                `"${review.property_name}"`,
                `"${review.guest_name}"`,
                review.rating,
                review.channel,
                review.status,
                `"${review.review_text.replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reviews-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                        <span>Loading reviews...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">Error loading reviews: {error}</p>
                        <Button onClick={fetchReviews}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reviews Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage and approve guest reviews for Flex Living properties
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Landing
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button onClick={fetchReviews} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="reviews" className="space-y-6">
                <TabsList className="border bg-white">
                    <TabsTrigger value="reviews">Reviews Management</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics & Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="reviews" className="space-y-6">
                    <ReviewFilters />
                    <ReviewTable />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <PropertyStats />
                </TabsContent>
            </Tabs>
        </div>
    )
}
