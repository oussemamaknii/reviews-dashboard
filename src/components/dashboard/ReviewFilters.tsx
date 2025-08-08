"use client"

import { useState } from 'react'
import { useReviewStore } from '@/stores/reviewStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Filter } from 'lucide-react'

export function ReviewFilters() {
    const { filters, setFilters, clearFilters, properties, reviews } = useReviewStore()
    const [isExpanded, setIsExpanded] = useState(false)

    const uniqueProperties = Array.from(new Set(reviews.map(r => r.property_name)))
    const uniqueChannels = Array.from(new Set(reviews.map(r => r.channel)))

    const activeFiltersCount = Object.entries(filters).filter(([key, value]) =>
        value !== undefined && value !== null && value !== '' && key !== 'status' || (key === 'status' && value !== 'all')
    ).length

    return (
        <Card className="shadow-sm border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Collapse' : 'Expand'}
                        </Button>
                        {activeFiltersCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 bg-white dark:bg-gray-900">
                {/* Always visible filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-300">Status</label>
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(value) => setFilters({ status: value as 'pending' | 'approved' | 'rejected' | 'all' })}
                        >
                            <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                <SelectItem value="all" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">All Statuses</SelectItem>
                                <SelectItem value="pending" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Pending</SelectItem>
                                <SelectItem value="approved" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Approved</SelectItem>
                                <SelectItem value="rejected" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-300">Property</label>
                        <Select
                            value={filters.property || 'all'}
                            onValueChange={(value) => setFilters({ property: value === 'all' ? undefined : value })}
                        >
                            <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <SelectValue placeholder="All properties" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                <SelectItem value="all" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">All Properties</SelectItem>
                                {uniqueProperties.map(property => (
                                    <SelectItem key={property} value={property} className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        {property}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-300">Channel</label>
                        <Select
                            value={filters.channel || 'all'}
                            onValueChange={(value) => setFilters({ channel: value === 'all' ? undefined : value })}
                        >
                            <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <SelectValue placeholder="All channels" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                <SelectItem value="all" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">All Channels</SelectItem>
                                {uniqueChannels.map(channel => (
                                    <SelectItem key={channel} value={channel} className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        {channel.charAt(0).toUpperCase() + channel.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Expandable filters */}
                {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                            <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-300">Min Rating</label>
                            <Input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={filters.rating_min || ''}
                                onChange={(e) => setFilters({
                                    rating_min: e.target.value ? parseFloat(e.target.value) : undefined
                                })}
                                placeholder="0.0"
                                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-300">Max Rating</label>
                            <Input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={filters.rating_max || ''}
                                onChange={(e) => setFilters({
                                    rating_max: e.target.value ? parseFloat(e.target.value) : undefined
                                })}
                                placeholder="10.0"
                                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-300">From Date</label>
                            <Input
                                type="date"
                                value={filters.date_from ? filters.date_from.toISOString().split('T')[0] : ''}
                                onChange={(e) => setFilters({
                                    date_from: e.target.value ? new Date(e.target.value) : undefined
                                })}
                                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-300">To Date</label>
                            <Input
                                type="date"
                                value={filters.date_to ? filters.date_to.toISOString().split('T')[0] : ''}
                                onChange={(e) => setFilters({
                                    date_to: e.target.value ? new Date(e.target.value) : undefined
                                })}
                                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                        </div>
                    </div>
                )}

                {/* Active filters display */}
                {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Active filters:</span>
                        {filters.status && filters.status !== 'all' && (
                            <Badge variant="secondary" className="gap-1">
                                Status: {filters.status}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => setFilters({ status: 'all' })}
                                />
                            </Badge>
                        )}
                        {filters.property && (
                            <Badge variant="secondary" className="gap-1">
                                Property: {filters.property.split(' - ')[0]}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => setFilters({ property: undefined })}
                                />
                            </Badge>
                        )}
                        {filters.channel && (
                            <Badge variant="secondary" className="gap-1">
                                Channel: {filters.channel}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => setFilters({ channel: undefined })}
                                />
                            </Badge>
                        )}
                        {(filters.rating_min || filters.rating_max) && (
                            <Badge variant="secondary" className="gap-1">
                                Rating: {filters.rating_min || 0}-{filters.rating_max || 10}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => setFilters({ rating_min: undefined, rating_max: undefined })}
                                />
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
