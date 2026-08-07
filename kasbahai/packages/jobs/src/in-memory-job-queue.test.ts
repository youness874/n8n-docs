import { describe, expect, it } from 'vitest';
import { InMemoryJobQueue } from './drivers/in-memory-job-queue';

describe('InMemoryJobQueue', () => {
  it('returns before the handler runs, then completes it in the background', async () => {
    const queue = new InMemoryJobQueue();
    const seen: unknown[] = [];
    let resolveHandler!: () => void;
    queue.registerHandler<{ text: string }>('segment-transcript', async (payload) => {
      await new Promise<void>((resolve) => {
        resolveHandler = resolve;
      });
      seen.push(payload);
    });

    const { jobId } = await queue.enqueue('segment-transcript', { text: 'hello' });

    // enqueue() must not have waited for the handler: it hasn't run yet.
    expect(seen).toEqual([]);
    expect(queue.getJob(jobId)?.status).not.toBe('succeeded');

    resolveHandler();
    await queue.waitFor(jobId);

    expect(seen).toEqual([{ text: 'hello' }]);
    expect(queue.getJob(jobId)?.status).toBe('succeeded');
  });

  it('marks a job failed after exhausting retries', async () => {
    const queue = new InMemoryJobQueue();
    let attempts = 0;
    queue.registerHandler('always-fails', async () => {
      attempts += 1;
      throw new Error('boom');
    });

    const { jobId } = await queue.enqueue('always-fails', {}, { maxAttempts: 3 });
    await queue.waitFor(jobId);

    expect(attempts).toBe(3);
    const job = queue.getJob(jobId);
    expect(job?.status).toBe('failed');
    expect(job?.error).toBe('boom');
  });

  it('fails immediately when no handler is registered for the job type', async () => {
    const queue = new InMemoryJobQueue();
    const { jobId } = await queue.enqueue('unregistered-type', {});
    await queue.waitFor(jobId);

    const job = queue.getJob(jobId);
    expect(job?.status).toBe('failed');
    expect(job?.error).toContain('No handler registered');
  });
});
