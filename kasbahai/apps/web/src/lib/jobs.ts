import { eq } from 'drizzle-orm';
import { schema } from '@kasbahai/db';
import { createJobQueueFromEnv, type JobQueue } from '@kasbahai/jobs';
import { DefaultSourceProcessor } from '@kasbahai/module-source-processor';
import { getDb } from './db';

export const SEGMENT_TRANSCRIPT_JOB = 'segment-transcript';

export interface SegmentTranscriptPayload {
  transcriptId: string;
}

let instance: JobQueue | undefined;

/**
 * One process-wide queue with handlers registered once. Segmentation is
 * deterministic (not an AI call) but still runs through the job
 * abstraction, since it is the long-running step in the Import → Understand
 * transition and future steps (AI-driven intelligence extraction) plug
 * into the same queue.
 */
export function getJobQueue(): JobQueue {
  if (instance) return instance;

  instance = createJobQueueFromEnv();
  instance.registerHandler<SegmentTranscriptPayload>(SEGMENT_TRANSCRIPT_JOB, async (payload) => {
    const db = getDb();
    const transcript = await db.query.transcripts.findFirst({
      where: (t, { eq: eqOp }) => eqOp(t.id, payload.transcriptId),
    });
    if (!transcript) {
      throw new Error(`Transcript ${payload.transcriptId} not found`);
    }

    await db
      .update(schema.transcripts)
      .set({ status: 'processing' })
      .where(eq(schema.transcripts.id, transcript.id));

    try {
      const processor = new DefaultSourceProcessor();
      const result = await processor.process({
        transcriptId: transcript.id,
        rawText: transcript.rawText,
        inputFormat: transcript.inputFormat,
      });

      if (result.segments.length > 0) {
        await db.insert(schema.transcriptSegments).values(
          result.segments.map((segment) => ({
            workspaceId: transcript.workspaceId,
            transcriptId: transcript.id,
            index: segment.index,
            sectionTitle: segment.sectionTitle,
            speaker: segment.speaker,
            text: segment.text,
            startMs: segment.startMs,
            endMs: segment.endMs,
            isTopicChange: segment.isTopicChange,
            isExample: segment.isExample,
            isPromotional: segment.isPromotional,
            isUnclear: segment.isUnclear,
          })),
        );
      }

      await db
        .update(schema.transcripts)
        .set({
          status: 'ready',
          cleanText: result.cleanText,
          qualityScore: result.qualityScore,
        })
        .where(eq(schema.transcripts.id, transcript.id));
    } catch (error) {
      // Leaving the transcript at 'processing' forever would strand the
      // project: the UI hides the submission form once any transcript
      // exists, so there would be no way to retry. Mark it failed and
      // rethrow so the job record itself also reflects the failure.
      await db
        .update(schema.transcripts)
        .set({ status: 'failed' })
        .where(eq(schema.transcripts.id, transcript.id));
      throw error;
    }
  });

  return instance;
}
