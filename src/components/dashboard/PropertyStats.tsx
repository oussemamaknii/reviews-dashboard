"use client"

import { useReviewStore } from '@/stores/reviewStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Star, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatRating } from '@/lib/utils'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts'

export function PropertyStats() {
    // Use full dataset for global analytics (not affected by UI filters)
    const { properties, reviews, setFilters } = useReviewStore()

    const totalReviews = reviews.length
    const pendingReviews = reviews.filter(r => r.status === 'pending').length
    const approvedReviews = reviews.filter(r => r.status === 'approved').length
    const rejectedReviews = reviews.filter(r => r.status === 'rejected').length

    const overallRating = totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0

    const topProperties = [...properties]
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 5)

    const needsAttention = properties.filter(p =>
        p.average_rating < 7 || p.pending_reviews > 5
    )

    // ---- Rolling metrics & velocity ----
    type DailyPoint = { date: string; count: number; avg: number; approved: number; pending: number; rejected: number }
    const byDay = new Map<string, DailyPoint>()
    const dayKey = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10)
    reviews.forEach(r => {
        const key = dayKey(new Date(r.submitted_at))
        if (!byDay.has(key)) byDay.set(key, { date: key, count: 0, avg: 0, approved: 0, pending: 0, rejected: 0 })
        const dp = byDay.get(key)!
        dp.count += 1
        dp.avg += r.rating
        if (r.status === 'approved') dp.approved += 1
        else if (r.status === 'pending') dp.pending += 1
        else if (r.status === 'rejected') dp.rejected += 1
    })
    const daily = Array.from(byDay.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(d => ({ ...d, avg: d.count > 0 ? d.avg / d.count : 0 }))

    const rolling = (window: number) => {
        const out: { date: string; value: number }[] = []
        let sum = 0, cnt = 0
        const queue: number[] = []
        daily.forEach(d => {
            sum += d.avg
            cnt += 1
            queue.push(d.avg)
            if (cnt > window) {
                sum -= queue.shift()!
                cnt -= 1
            }
            out.push({ date: d.date, value: cnt > 0 ? sum / cnt : 0 })
        })
        return out
    }
    const rolling7 = rolling(7)
    const rolling28 = rolling(28)

    // ---- Sentiment & topics (lightweight heuristic) ----
    const negativeWords = ['dirty','noise','noisy','slow','late','bad','poor','broken','smell','rude','issue','problem','bugs','cold','hot','mold','wifi','wi-fi']
    const topics: Record<string, string[]> = {
        cleanliness: ['clean','dirty','dust','stain','smell','mold'],
        communication: ['host','responsive','rude','helpful','reply','communication'],
        wifi: ['wifi','wi-fi','internet','speed','slow'],
        noise: ['noise','noisy','quiet','street','neighbors'],
        checkin: ['check-in','check in','keys','access','code'],
        comfort: ['bed','mattress','hot','cold','heating','ac','aircon','shower'],
        location: ['location','area','walk','transport','tube','bus']
    }
    function scoreSentiment(text: string): number {
        const t = text.toLowerCase()
        let score = 0
        negativeWords.forEach(w => { if (t.includes(w)) score -= 1 })
        return score
    }
    const topicCounts: Record<string, { positive: number; negative: number; total: number }> = {}
    Object.keys(topics).forEach(k => (topicCounts[k] = { positive: 0, negative: 0, total: 0 }))
    reviews.forEach(r => {
        const s = scoreSentiment(r.review_text)
        const t = r.review_text.toLowerCase()
        for (const [topic, kws] of Object.entries(topics)) {
            if (kws.some(k => t.includes(k))) {
                topicCounts[topic].total += 1
                if (s < 0 || r.rating < 6) topicCounts[topic].negative += 1
                else topicCounts[topic].positive += 1
            }
        }
    })
    const topIssues = Object.entries(topicCounts)
        .map(([k, v]) => ({ topic: k, negative: v.negative, total: v.total }))
        .sort((a, b) => b.negative - a.negative)
        .slice(0, 5)

    // ---- Simple anomaly detection (7d vs 28d) ----
    const last7 = rolling7.length > 0 ? rolling7[rolling7.length - 1].value : 0
    const last28 = rolling28.length > 0 ? rolling28[rolling28.length - 1].value : 0
    const drop = last28 > 0 ? last7 - last28 : 0
    const anomaly = drop < -0.8 // average rating dropped by >0.8 vs 28d

    return (
        <div className="grid gap-6">
            {anomaly && (
                <Card className="border-amber-300">
                    <CardContent className="py-3 text-sm flex items-center justify-between">
                        <div className="text-amber-700">
                            Rating drop detected: 7‑day avg {formatRating(last7)} vs 28‑day avg {formatRating(last28)}
                        </div>
                        <Badge
                            className="cursor-pointer bg-white border border-amber-300 text-amber-700"
                            onClick={() => setFilters({ date_from: new Date(Date.now() - 28*24*60*60*1000) })}
                        >
                            View last 28 days
                        </Badge>
                    </CardContent>
                </Card>
            )}
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
                                                <Badge variant="destructive" className="text-xs cursor-pointer" onClick={() => setFilters({ property: property.property_name })}>
                                                    Low Rating
                                                </Badge>
                                            )}
                                            {property.pending_reviews > 5 && (
                                                <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => setFilters({ property: property.property_name, status: 'pending' })}>
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

            {/* Rolling Ratings (7d & 28d) */}
            <Card>
                <CardHeader>
                    <CardTitle>Rolling Rating Averages (7/28 days)</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} hide />
                            <YAxis domain={[0, 10]} />
                            <Tooltip />
                            <Legend />
                            <Line data={rolling7} name="7d" type="monotone" dataKey="value" stroke="#6366f1" dot={false} />
                            <Line data={rolling28} name="28d" type="monotone" dataKey="value" stroke="#94a3b8" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Review Velocity (per day) */}
            <Card>
                <CardHeader>
                    <CardTitle>Review Velocity (Daily)</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={daily}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" hide />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#22c55e" name="Reviews" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Status Over Time */}
            <Card>
                <CardHeader>
                    <CardTitle>Status Over Time</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={daily}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" hide />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="approved" stackId="1" stroke="#16a34a" fill="#86efac" name="Approved" />
                            <Area type="monotone" dataKey="pending" stackId="1" stroke="#ca8a04" fill="#fde68a" name="Pending" />
                            <Area type="monotone" dataKey="rejected" stackId="1" stroke="#dc2626" fill="#fca5a5" name="Rejected" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top Issues (last period) */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Issues (mentions)</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topIssues}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="topic" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="negative" fill="#ef4444" name="Negative Mentions" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
