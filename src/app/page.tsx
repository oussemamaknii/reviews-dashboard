import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, BarChart3, Users, Settings } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-5 pt-6">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-xs border text-muted-foreground">
            Flex Living · Reviews & Reputation
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="brand-gradient-text">Reviews Dashboard</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Centralize guest feedback, analyze trends, and publish only the best reviews to your property pages.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                <BarChart3 className="h-5 w-5 mr-2" />
                Open Dashboard
              </Button>
            </Link>
            <Link href="/properties">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Star className="h-5 w-5 mr-2" />
                View Properties & Reviews
              </Button>
            </Link>
            <Link href="/yelp-reviews">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sync Yelp Reviews
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                <CardTitle>Review Management</CardTitle>
              </div>
              <CardDescription>
                Approve, reject, and curate guest reviews across channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Bulk approve/reject</li>
                <li>• Category-based ratings</li>
                <li>• Status workflow</li>
                <li>• CSV export</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <CardTitle>Analytics & Insights</CardTitle>
              </div>
              <CardDescription>
                Monitor property performance and identify trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Property performance metrics</li>
                <li>• Rating trend analysis</li>
                <li>• Issue identification</li>
                <li>• Comparative insights</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-500" />
                <CardTitle>Multi-Channel Integration</CardTitle>
              </div>
              <CardDescription>
                Centralized reviews from Hostaway, Yelp, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Hostaway API integration</li>
                <li>• Yelp Reviews sync</li>
                <li>• Unified data format</li>
                <li>• Real-time updates</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>From ingestion to publish in 3 steps</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 list-decimal list-inside">
              <li>
                <div className="font-semibold">Ingest</div>
                <div className="text-sm text-muted-foreground">Pull reviews from Hostaway and Yelp, normalize to a single schema.</div>
              </li>
              <li>
                <div className="font-semibold">Moderate</div>
                <div className="text-sm text-muted-foreground">Approve or reject in the dashboard with filters and bulk actions.</div>
              </li>
              <li>
                <div className="font-semibold">Publish</div>
                <div className="text-sm text-muted-foreground">Only approved reviews appear on property pages.</div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Access the Dashboard</h4>
              <p className="text-sm text-muted-foreground">
                Navigate to the Reviews Dashboard to see all pending reviews that need your attention.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">2. Review and Approve</h4>
              <p className="text-sm text-muted-foreground">
                Use the filtering options to find specific reviews, then approve or reject them based on your criteria.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">3. Monitor Performance</h4>
              <p className="text-sm text-muted-foreground">
                Check the Analytics tab to monitor property performance and identify areas for improvement.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">4. Import Yelp</h4>
              <p className="text-sm text-muted-foreground">
                Use the Yelp page to search/import reviews or run the server endpoint to ingest businesses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}