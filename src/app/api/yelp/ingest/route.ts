import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { yelpService } from '@/services/yelp'

export async function POST(request: Request) {
  try {
    const { location = 'London, UK', maxBusinesses = 20 } = (await request.json()) as {
      location?: string
      maxBusinesses?: number
    }

    const prisma = new PrismaClient()

    // 1) Get candidate business IDs via Yelp AI
    // Rollback: use AI endpoint that returns only business IDs (with min 2 reviews)
    const businessIds = await yelpService.aiListRentalBusinessIds({ location, maxIds: maxBusinesses })
    console.log('Yelp AI businessIds:', businessIds)
    const reviewUrls = businessIds.map(id => `https://api.yelp.com/v3/businesses/${id}/reviews?limit=20&sort_by=yelp_sort`)

    if (businessIds.length === 0) {
      return NextResponse.json({ success: true, ingested: 0, message: 'No business IDs returned by Yelp AI' })
    }

    // 2) For each business, fetch details + reviews, then upsert into DB
    let ingested = 0
    const failures: Array<{ id: string; error: string }> = []
    for (const businessId of businessIds) {
      try {
        const details = await yelpService.getBusinessDetails(businessId)
        let reviews = await yelpService.getBusinessReviews(businessId, 20, 'yelp_sort') as Array<{
          id: string
          rating: number
          text: string
          time_created: string
          user: { id: string; name: string }
        }>

        // Upsert Property by name (schema requires unique name)
        const propertyId = `yelp_${details.id}`
        await prisma.property.upsert({
          where: { id: propertyId },
          update: {
            name: details.name,
            location: details.location?.display_address?.join(', ') || '',
            imageUrl: (details as unknown as { image_url?: string }).image_url ?? details.url,
            pricePerNight: 0,
            maxGuests: 0,
          },
          create: {
            id: propertyId,
            name: details.name,
            location: details.location?.display_address?.join(', ') || '',
            imageUrl: (details as unknown as { image_url?: string }).image_url ?? details.url,
            pricePerNight: 0,
            maxGuests: 0,
          },
        })

        // If official endpoint failed or returned empty, ask AI for minimal review data
        if (!reviews || reviews.length === 0) {
          const aiSummaries = await yelpService.aiSummarizeBusinesses({ ids: [businessId], location, maxReviewsPerBusiness: 3 })
          const topSumm = aiSummaries[0]?.top_reviews || []
          reviews = topSumm.map((r, idx) => ({
            id: `${businessId}_ai_${idx}`,
            rating: r.rating ?? 0,
            text: r.text ?? 'Review from AI summary',
            time_created: r.time_created ?? new Date().toISOString(),
            user: { id: `${businessId}_ai_user_${idx}`, name: r.user_name ?? 'Yelp User' }
          }))
        }

        // Insert reviews (avoid dupes by id)
        for (const review of reviews) {
          const reviewId = `yelp_${review.id}`
          await prisma.review.upsert({
            where: { id: reviewId },
            update: {
              propertyId,
              channel: 'yelp',
              guestName: review.user.name,
              rating: review.rating,
              reviewText: review.text,
              submittedAt: new Date(review.time_created),
              status: 'approved',
              isPublic: true,
            },
            create: {
              id: reviewId,
              propertyId,
              channel: 'yelp',
              guestName: review.user.name,
              rating: review.rating,
              reviewText: review.text,
              submittedAt: new Date(review.time_created),
              status: 'approved',
              isPublic: true,
            },
          })
        }

        // If no reviews available, create a business-info pseudo review so the property is visible
        if (reviews.length === 0) {
          const fallbackId = `yelp_business_${details.id}`
          const address = details.location?.display_address?.join(', ') || ''
          await prisma.review.upsert({
            where: { id: fallbackId },
            update: {
              propertyId,
              channel: 'yelp',
              guestName: 'Yelp Business Info',
              rating: details.rating ?? 0,
              reviewText: `${details.name} - ${address} | ${details.review_count} reviews on Yelp`,
              submittedAt: new Date(),
              status: 'approved',
              isPublic: true,
            },
            create: {
              id: fallbackId,
              propertyId,
              channel: 'yelp',
              guestName: 'Yelp Business Info',
              rating: details.rating ?? 0,
              reviewText: `${details.name} - ${address} | ${details.review_count} reviews on Yelp`,
              submittedAt: new Date(),
              status: 'approved',
              isPublic: true,
            },
          })
        }

        ingested++
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        console.warn('Skipping business due to error', businessId, message)
        failures.push({ id: businessId, error: message })
      }
    }

    return NextResponse.json({ success: true, ingested, totalCandidates: businessIds.length, businessIds, reviewUrls, failures })
  } catch (error) {
    console.error('Yelp ingest error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
