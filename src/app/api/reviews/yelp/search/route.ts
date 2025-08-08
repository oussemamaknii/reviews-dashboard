import { NextResponse } from 'next/server'
import { yelpService } from '@/services/yelp'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const location = searchParams.get('location') || 'London, UK'
    const categories = searchParams.get('categories') || undefined

    if (!query) {
        return NextResponse.json({ success: false, error: 'Missing query parameter' }, { status: 400 })
    }

    try {
        const reviews = await yelpService.getReviewsByQuery(query, location, categories)
        return NextResponse.json({ success: true, data: reviews })
    } catch (error: any) {
        console.error('❌ Yelp API Route Error:', error)
        return NextResponse.json({ success: false, error: error?.message || 'Unknown error' }, { status: 503 })
    }
}
