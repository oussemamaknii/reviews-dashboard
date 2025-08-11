import { NextResponse } from 'next/server'
import { ReviewStatus } from '@prisma/client'
import { jobQueue } from '@/lib/jobQueue'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { id: string; status: ReviewStatus }
    const idemKey = request.headers.get('Idempotency-Key') || undefined

    const job = jobQueue.enqueue({ type: 'update-status', id: body.id, status: body.status }, idemKey)

    return NextResponse.json(
      { success: true, jobId: job.id, state: job.state },
      { status: 202 }
    )
  } catch (error) {
    console.error('Update status error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 })
  }
}
