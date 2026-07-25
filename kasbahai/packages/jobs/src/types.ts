export interface JobContext {
  jobId: string;
  jobType: string;
  attempt: number;
}

export type JobHandler<Payload = unknown> = (
  payload: Payload,
  context: JobContext,
) => Promise<void>;

export interface EnqueueOptions {
  jobId?: string;
  /** Number of attempts before the job is considered permanently failed. */
  maxAttempts?: number;
}

export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export interface JobRecord<Payload = unknown> {
  jobId: string;
  jobType: string;
  payload: Payload;
  status: JobStatus;
  attempt: number;
  maxAttempts: number;
  error?: string;
}

/**
 * Long AI operations (transcript segmentation, video generation, ...) run
 * through this abstraction rather than inline in a request handler. The
 * in-memory driver is for local dev/tests; a durable driver (e.g. pg-boss
 * or BullMQ) implements the same interface for production.
 */
export interface JobQueue {
  registerHandler<Payload>(jobType: string, handler: JobHandler<Payload>): void;
  enqueue<Payload>(
    jobType: string,
    payload: Payload,
    options?: EnqueueOptions,
  ): Promise<{ jobId: string }>;
  getJob(jobId: string): JobRecord | undefined;
}
