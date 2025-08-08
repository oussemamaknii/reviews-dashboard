/* eslint-disable no-console */
import { PrismaClient, ReviewStatus } from '@prisma/client'
import propertiesData from '../src/data/properties.json'
import mockReviews from '../src/data/hostaway_mock_reviews.json'
import crypto from 'node:crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Upsert properties
  for (const p of propertiesData as Array<any>) {
    await prisma.property.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        location: p.location,
        imageUrl: p.imageUrl,
        pricePerNight: p.pricePerNight,
        maxGuests: p.maxGuests,
      },
      create: {
        id: p.id,
        name: p.name,
        location: p.location,
        imageUrl: p.imageUrl,
        pricePerNight: p.pricePerNight,
        maxGuests: p.maxGuests,
      }
    })
  }

  // Index properties by name for linking
  const nameToId = new Map<string, string>(
    (propertiesData as Array<any>).map(p => [p.name.toLowerCase(), p.id])
  )

  // Insert reviews mapped to properties (only those matching our 4 properties)
  const selected = (mockReviews as Array<any>).filter(r => nameToId.has(String(r.listingName).toLowerCase()))

  for (const r of selected) {
    const propertyId = nameToId.get(String(r.listingName).toLowerCase()) as string
    const reviewId = `rev_${r.id}`

    const statusCycle: ReviewStatus[] = [ReviewStatus.approved, ReviewStatus.pending, ReviewStatus.rejected]
    const status = statusCycle[(r.id as number) % 3]

    await prisma.review.upsert({
      where: { id: reviewId },
      update: {
        propertyId,
        channel: 'hostaway',
        guestName: r.guestName,
        rating: Number(r.rating ?? 0),
        reviewText: String(r.publicReview ?? ''),
        submittedAt: new Date(r.submittedAt),
        status,
        isPublic: status === ReviewStatus.approved,
      },
      create: {
        id: reviewId,
        propertyId,
        channel: 'hostaway',
        guestName: r.guestName,
        rating: Number(r.rating ?? 0),
        reviewText: String(r.publicReview ?? ''),
        submittedAt: new Date(r.submittedAt),
        status,
        isPublic: status === ReviewStatus.approved,
      }
    })

    // Categories
    if (Array.isArray(r.reviewCategory)) {
      for (const c of r.reviewCategory) {
        const catId = crypto.randomUUID()
        await prisma.reviewCategory.upsert({
          where: { id: catId },
          update: {},
          create: {
            id: catId,
            reviewId,
            category: String(c.category),
            rating: Number(c.rating ?? 0),
          }
        })
      }
    }
  }

  console.log('Seed completed.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
