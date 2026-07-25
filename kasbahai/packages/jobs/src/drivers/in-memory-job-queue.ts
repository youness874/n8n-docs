import { randomUUID } from 'node:crypto';
import type { EnqueueOptions, JobHandler, JobQueue, JobRecord } from '../types';

/**
 * Runs each enqueued job on the microtask queue, decoupled from the
 * caller's call stack — enqueue() returns as soon as the job is recorded,
 * never waiting for the handler. This matters for callers like a Next.js
 * server action: the request should return once work is queued, not block
 * for however long the handler takes. Good enough for local development
 * and tests; a durable driver (pg-boss, BullMQ, ...) implements the same
 * JobQueue interface for production.
 */
export class InMemoryJobQueue implements JobQueue {
  private readonly handlers = new Map<string, JobHandler<unknown>>();
  private readonly jobs = new Map<string, JobRecord>();
  private readonly completions = new Map<string, Promise<void>>();

  registerHandler<Payload>(jobType: string, handler: JobHandler<Payload>): void {
    this.handlers.set(jobType, handler as JobHandler<unknown>);
  }

  async enqueue<Payload>(
    jobType: string,
    payload: Payload,
    options: EnqueueOptions = {},
  ): Promise<{ jobId: string }> {
    const jobId = options.jobId ?? randomUUID();
    const maxAttempts = options.maxAttempts ?? 1;
    const record: JobRecord<Payload> = {
      jobId,
      jobType,
      payload,
      status: 'queued',
      attempt: 0,
      maxAttempts,
    };
    this.jobs.set(jobId, record as JobRecord);

    this.completions.set(
      jobId,
      new Promise<void>((resolve) => {
        queueMicrotask(() => {
          void this.run(record).then(resolve);
        });
      }),
    );

    return { jobId };
  }

  getJob(jobId: string): JobRecord | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Not part of the JobQueue interface — a dev/test-only hook to await a
   * specific job reaching a terminal status, since enqueue() itself no
   * longer waits for it.
   */
  async waitFor(jobId: string): Promise<JobRecord | undefined> {
    await this.completions.get(jobId);
    return this.jobs.get(jobId);
  }

  private async run<Payload>(record: JobRecord<Payload>): Promise<void> {
    const handler = this.handlers.get(record.jobType);
    if (!handler) {
      record.status = 'failed';
      record.error = `No handler registered for job type "${record.jobType}"`;
      return;
    }

    while (record.attempt < record.maxAttempts) {
      record.attempt += 1;
      record.status = 'running';
      try {
        await handler(record.payload, {
          jobId: record.jobId,
          jobType: record.jobType,
          attempt: record.attempt,
        });
        record.status = 'succeeded';
        record.error = undefined;
        return;
      } catch (error) {
        record.error = error instanceof Error ? error.message : String(error);
      }
    }
    record.status = 'failed';
  }
}
