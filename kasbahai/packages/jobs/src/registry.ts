import { InMemoryJobQueue } from './drivers/in-memory-job-queue';
import type { JobQueue } from './types';

/**
 * Which queue driver backs the abstraction is configuration, not code.
 * Add a new case (and a new JobQueue implementation) here to plug in a
 * durable driver — callers of enqueue/registerHandler never change.
 */
export function createJobQueueFromEnv(env: NodeJS.ProcessEnv = process.env): JobQueue {
  const driver = env.JOBS_DRIVER ?? 'memory';

  switch (driver) {
    case 'memory':
      return new InMemoryJobQueue();
    default:
      throw new Error(
        `Unknown JOBS_DRIVER "${driver}". Register a driver in packages/jobs/src/registry.ts.`,
      );
  }
}
