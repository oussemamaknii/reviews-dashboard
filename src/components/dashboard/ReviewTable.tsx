"use client"

import { useState } from 'react'
import { useReviewStore } from '@/stores/reviewStore'
import { NormalizedReview } from '@/types/review'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import {
    CheckCircle,
    XCircle,
    Clock,
    MoreHorizontal,
    Eye,
    Star,
    ArrowUpDown
} from 'lucide-react'
import { formatDate, formatRating, getReviewChannelColor } from '@/lib/utils'

type SortField = 'submitted_at' | 'rating' | 'property_name' | 'guest_name' | 'status'
type SortOrder = 'asc' | 'desc'

export function ReviewTable() {
    const {
        filteredReviews,
        selectedReviews,
        toggleReviewSelection,
        selectAllReviews,
        clearSelection,
        updateReviewStatus,
        bulkUpdateStatus
    } = useReviewStore()

    const [sortField, setSortField] = useState<SortField>('submitted_at')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
    const [selectedReview, setSelectedReview] = useState<NormalizedReview | null>(null)

    const sortedReviews = [...filteredReviews].sort((a, b) => {
        let aValue: any = a[sortField]
        let bValue: any = b[sortField]

        if (sortField === 'submitted_at') {
            aValue = new Date(aValue).getTime()
            bValue = new Date(bValue).getTime()
        }

        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
        return 0
    })

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-600" />
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />
            default:
                return null
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const isAllSelected = selectedReviews.size === filteredReviews.length && filteredReviews.length > 0
    const isIndeterminate = selectedReviews.size > 0 && selectedReviews.size < filteredReviews.length

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>
                        Reviews ({filteredReviews.length})
                    </CardTitle>

                    {selectedReviews.size > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {selectedReviews.size} selected
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => bulkUpdateStatus('approved')}
                                className="text-green-600 hover:text-green-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => bulkUpdateStatus('rejected')}
                                className="text-red-600 hover:text-red-700"
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={clearSelection}
                            >
                                Clear
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={isAllSelected}
                                        indeterminate={isIndeterminate}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                selectAllReviews()
                                            } else {
                                                clearSelection()
                                            }
                                        }}
                                    />
                                </TableHead>

                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort('submitted_at')}
                                >
                                    <div className="flex items-center gap-1">
                                        Date
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>

                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort('property_name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Property
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>

                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort('guest_name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Guest
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>

                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort('rating')}
                                >
                                    <div className="flex items-center gap-1">
                                        Rating
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>

                                <TableHead>Channel</TableHead>

                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        Status
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>

                                <TableHead>Review</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {sortedReviews.map((review) => (
                                <TableRow
                                    key={review.id}
                                    className={selectedReviews.has(review.id) ? 'bg-muted/50' : ''}
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedReviews.has(review.id)}
                                            onCheckedChange={() => toggleReviewSelection(review.id)}
                                        />
                                    </TableCell>

                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDate(review.submitted_at)}
                                    </TableCell>

                                    <TableCell className="font-medium">
                                        <div className="max-w-[200px] truncate">
                                            {review.property_name.split(' - ')[0]}
                                        </div>
                                    </TableCell>

                                    <TableCell>{review.guest_name}</TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            {formatRating(review.rating)}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge className={getReviewChannelColor(review.channel)}>
                                            {review.channel}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(review.status)}
                                            <Badge className={getStatusColor(review.status)}>
                                                {review.status}
                                            </Badge>
                                        </div>
                                    </TableCell>

                                    <TableCell className="max-w-[300px]">
                                        <div className="truncate text-sm text-muted-foreground">
                                            {review.review_text}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setSelectedReview(review)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {review.status !== 'approved' && (
                                                    <DropdownMenuItem
                                                        onClick={() => updateReviewStatus(review.id, 'approved')}
                                                        className="text-green-600"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Approve
                                                    </DropdownMenuItem>
                                                )}
                                                {review.status !== 'rejected' && (
                                                    <DropdownMenuItem
                                                        onClick={() => updateReviewStatus(review.id, 'rejected')}
                                                        className="text-red-600"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Reject
                                                    </DropdownMenuItem>
                                                )}
                                                {review.status !== 'pending' && (
                                                    <DropdownMenuItem
                                                        onClick={() => updateReviewStatus(review.id, 'pending')}
                                                        className="text-yellow-600"
                                                    >
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        Set Pending
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {/* Review Details Dialog */}
            <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Review Details</DialogTitle>
                    </DialogHeader>

                    {selectedReview && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold mb-1">Property</h4>
                                    <p className="text-sm text-muted-foreground">{selectedReview.property_name}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Guest</h4>
                                    <p className="text-sm text-muted-foreground">{selectedReview.guest_name}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Rating</h4>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm">{formatRating(selectedReview.rating)}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Date</h4>
                                    <p className="text-sm text-muted-foreground">{formatDate(selectedReview.submitted_at)}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Review Text</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {selectedReview.review_text}
                                </p>
                            </div>

                            {selectedReview.categories.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Category Ratings</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedReview.categories.map((category, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                                <span className="text-sm capitalize">{category.category.replace('_', ' ')}</span>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-medium">{category.rating}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t">
                                <Button
                                    onClick={() => {
                                        updateReviewStatus(selectedReview.id, 'approved')
                                        setSelectedReview(null)
                                    }}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        updateReviewStatus(selectedReview.id, 'rejected')
                                        setSelectedReview(null)
                                    }}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}
