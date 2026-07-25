import { z } from 'zod';
import { schemaVersion, timestamps, workspaceScoped } from './common';

export const TranscriptSegmentSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  transcriptId: z.string().uuid(),
  index: z.number().int().nonnegative(),
  sectionTitle: z.string().optional(),
  speaker: z.string().optional(),
  text: z.string().min(1),
  startMs: z.number().int().nonnegative().optional(),
  endMs: z.number().int().nonnegative().optional(),
  isTopicChange: z.boolean().default(false),
  isExample: z.boolean().default(false),
  isPromotional: z.boolean().default(false),
  isUnclear: z.boolean().default(false),
  ...timestamps,
});
export type TranscriptSegment = z.infer<typeof TranscriptSegmentSchemaV1>;

export const TranscriptSegmentSchema = TranscriptSegmentSchemaV1;
