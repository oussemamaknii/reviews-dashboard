import { NextResponse } from 'next/server'
import { jobQueue } from '@/lib/jobQueue'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const job = jobQueue.getJob(id)
  if (!job) {
    return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, job })
}
