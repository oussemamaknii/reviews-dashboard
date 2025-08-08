import { NextResponse } from 'next/server'
import { PrismaClient, ReviewStatus } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { id: string; status: ReviewStatus }
    const prisma = new PrismaClient()

    const updated = await prisma.review.update({
      where: { id: body.id },
      data: { status: body.status }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update status error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 })
  }
}
