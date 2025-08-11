import { NextResponse } from 'next/server'
import { jobQueue, JobRecord } from '@/lib/jobQueue'

export const runtime = 'nodejs'

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      const send = (job: JobRecord) => {
        const data = JSON.stringify({ id: job.id, state: job.state, attempts: job.attempts, error: job.lastError })
        controller.enqueue(encoder.encode(`event: job\n`))
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      const listener = (job: JobRecord) => send(job)
      jobQueue.on('update', listener)

      // Heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`event: ping\n`))
        controller.enqueue(encoder.encode(`data: ${Date.now()}\n\n`))
      }, 15000)

      // Cleanup
      return () => {
        clearInterval(heartbeat)
        jobQueue.off('update', listener)
      }
    },
    cancel() {
      // No-op
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Transfer-Encoding': 'chunked',
    },
  })
}
