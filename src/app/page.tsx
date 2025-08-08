import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, BarChart3, Users, Settings } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Flex Living Reviews Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage guest reviews, monitor property performance, and maintain your reputation
            across all booking channels from one central dashboard.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg">
                <BarChart3 className="h-5 w-5 mr-2" />
                Open Dashboard
              </Button>
            </Link>
            <Link href="/properties">
              <Button variant="outline" size="lg">
                <Star className="h-5 w-5 mr-2" />
                View Properties & Reviews
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                <CardTitle>Review Management</CardTitle>
              </div>
              <CardDescription>
                Approve, reject, and moderate guest reviews from all channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Bulk approval actions</li>
                <li>• Detailed review analysis</li>
                <li>• Category-based ratings</li>
                <li>• Status tracking</li>
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

        {/* Quick Stats Preview */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>
              Current status of the reviews management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5</div>
                <div className="text-sm text-muted-foreground">Properties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">8.3</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">1</div>
                <div className="text-sm text-muted-foreground">Channels</div>
              </div>
            </div>
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
              <h4 className="font-semibold">4. Export Data</h4>
              <p className="text-sm text-muted-foreground">
                Export review data as CSV for external analysis or reporting purposes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}