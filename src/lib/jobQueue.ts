import { PrismaClient, ReviewStatus } from '@prisma/client'
import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'

export type JobState = 'queued' | 'processing' | 'succeeded' | 'failed'

export interface UpdateStatusJobPayload {
  type: 'update-status'
  id: string
  status: ReviewStatus
}

export interface BulkUpdateStatusJobPayload {
  type: 'bulk-update-status'
  ids: string[]
  status: ReviewStatus
}

export type JobPayload = UpdateStatusJobPayload | BulkUpdateStatusJobPayload

export interface JobRecord {
  id: string
  state: JobState
  payload: JobPayload
  attempts: number
  maxAttempts: number
  lastError?: string
  idempotencyKey?: string
  createdAt: number
  updatedAt: number
}

class InMemoryJobQueue {
  private jobs = new Map<string, JobRecord>()
  private idempotencyKeyToJobId = new Map<string, string>()
  private emitter = new EventEmitter()
  private prisma = new PrismaClient()

  // Backoff: base 500ms, exponential
  private baseDelayMs = 500

  enqueue(payload: JobPayload, idempotencyKey?: string, maxAttempts = 5): JobRecord {
    if (idempotencyKey) {
      const existingId = this.idempotencyKeyToJobId.get(idempotencyKey)
      if (existingId) {
        const existing = this.jobs.get(existingId)
        if (existing) return existing
      }
    }

    const id = randomUUID()
    const now = Date.now()
    const job: JobRecord = {
      id,
      state: 'queued',
      payload,
      attempts: 0,
      maxAttempts,
      createdAt: now,
      updatedAt: now,
      idempotencyKey,
    }
    this.jobs.set(id, job)
    if (idempotencyKey) this.idempotencyKeyToJobId.set(idempotencyKey, id)

    // Fire and forget processing cycle
    void this.process(job.id)

    return job
  }

  getJob(jobId: string): JobRecord | undefined {
    return this.jobs.get(jobId)
  }

  on(event: 'update', listener: (job: JobRecord) => void): void {
    this.emitter.on(event, listener)
  }

  off(event: 'update', listener: (job: JobRecord) => void): void {
    this.emitter.off(event, listener)
  }

  private emitUpdate(job: JobRecord) {
    this.emitter.emit('update', job)
  }

  private async process(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId)
    if (!job) return

    if (job.state !== 'queued' && job.state !== 'failed') return

    job.state = 'processing'
    job.updatedAt = Date.now()
    this.emitUpdate(job)

    try {
      job.attempts += 1

      if (job.payload.type === 'update-status') {
        await this.prisma.review.update({
          where: { id: job.payload.id },
          data: { status: job.payload.status },
        })
      } else if (job.payload.type === 'bulk-update-status') {
        await this.prisma.review.updateMany({
          where: { id: { in: job.payload.ids } },
          data: { status: job.payload.status },
        })
      }

      job.state = 'succeeded'
      job.updatedAt = Date.now()
      job.lastError = undefined
      this.emitUpdate(job)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      job.lastError = message
      if (job.attempts >= job.maxAttempts) {
        job.state = 'failed'
        job.updatedAt = Date.now()
        this.emitUpdate(job)
        return
      }

      // Schedule retry with exponential backoff and jitter
      const delay = Math.min(30_000, this.baseDelayMs * Math.pow(2, job.attempts - 1))
      const jitter = Math.floor(Math.random() * 250)
      job.state = 'queued'
      job.updatedAt = Date.now()
      this.emitUpdate(job)
      setTimeout(() => this.process(jobId).catch(() => {}), delay + jitter)
    }
  }
}

// Singleton across module imports
const globalForQueue = globalThis as unknown as { __jobQueue?: InMemoryJobQueue }
export const jobQueue = globalForQueue.__jobQueue ?? (globalForQueue.__jobQueue = new InMemoryJobQueue())
