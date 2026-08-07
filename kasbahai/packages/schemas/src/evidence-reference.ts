import { z } from 'zod';
import { schemaVersion, timestamps, workspaceScoped } from './common';

/**
 * Links a claim made anywhere downstream (an intelligence-map field, a
 * script line, ...) back to the transcript segment(s) it is grounded in.
 * Required by the accuracy quality gate: every claim must resolve to one
 * of these, or be explicitly flagged as unsupported.
 */
export const EvidenceReferenceSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  transcriptSegmentId: z.string().uuid(),
  quote: z.string().min(1),
  note: z.string().optional(),
  ...timestamps,
});
export type EvidenceReference = z.infer<typeof EvidenceReferenceSchemaV1>;

export const EvidenceReferenceSchema = EvidenceReferenceSchemaV1;
