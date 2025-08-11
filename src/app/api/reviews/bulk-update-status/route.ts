import { NextResponse } from 'next/server'
import { ReviewStatus } from '@prisma/client'
import { jobQueue } from '@/lib/jobQueue'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { ids: string[]; status: ReviewStatus }
    const idemKey = request.headers.get('Idempotency-Key') || undefined
    const job = jobQueue.enqueue({ type: 'bulk-update-status', ids: body.ids, status: body.status }, idemKey)

    return NextResponse.json(
      { success: true, jobId: job.id, state: job.state, count: body.ids.length },
      { status: 202 }
    )
  } catch (error) {
    console.error('Bulk update status error:', error)
    return NextResponse.json({ success: false, error: 'Failed to bulk update status' }, { status: 500 })
  }
}
