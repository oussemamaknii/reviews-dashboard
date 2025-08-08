import { NextResponse } from 'next/server'
import { PrismaClient, ReviewStatus } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { ids: string[]; status: ReviewStatus }
    const prisma = new PrismaClient()

    await prisma.review.updateMany({
      where: { id: { in: body.ids } },
      data: { status: body.status }
    })

    return NextResponse.json({ success: true, count: body.ids.length })
  } catch (error) {
    console.error('Bulk update status error:', error)
    return NextResponse.json({ success: false, error: 'Failed to bulk update status' }, { status: 500 })
  }
}
