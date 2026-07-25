import { randomUUID } from 'node:crypto';
import type { EnqueueOptions, JobHandler, JobQueue, JobRecord } from '../types';

/**
 * Runs each enqueued job on the microtask queue, one at a time per call to
 * enqueue. Good enough for local development and for tests that want a
 * real async handoff without standing up a broker.
 */
export class InMemoryJobQueue implements JobQueue {
  private readonly handlers = new Map<string, JobHandler<unknown>>();
  private readonly jobs = new Map<string, JobRecord>();

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

    await this.run(record);

    return { jobId };
  }

  getJob(jobId: string): JobRecord | undefined {
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
