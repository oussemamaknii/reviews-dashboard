import { YelpReviewsIntegration } from '@/components/dashboard/YelpReviewsIntegration'

export default function YelpReviewsPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Yelp Reviews Integration</h1>
                    <p className="text-muted-foreground mt-2">
                        Search and import business reviews from Yelp
                    </p>
                </div>

                <YelpReviewsIntegration />
            </div>
        </div>
    )
}
