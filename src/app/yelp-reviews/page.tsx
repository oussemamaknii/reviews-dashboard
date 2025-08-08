import { YelpReviewsIntegration } from '@/components/dashboard/YelpReviewsIntegration'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function YelpReviewsPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Yelp Reviews Integration</h1>
                        <p className="text-muted-foreground mt-2">
                            Search and import business reviews from Yelp
                        </p>
                    </div>
                    <Link href="/">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Landing
                        </Button>
                    </Link>
                </div>

                <YelpReviewsIntegration />
            </div>
        </div>
    )
}
