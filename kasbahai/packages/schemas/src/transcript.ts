import { z } from 'zod';
import { schemaVersion, timestamps, workspaceScoped } from './common';

export const TranscriptInputFormat = z.enum(['pasted', 'txt', 'docx', 'srt', 'vtt']);

export const TranscriptStatus = z.enum(['raw', 'processing', 'ready', 'failed']);

export const TranscriptSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  projectId: z.string().uuid(),
  sourceVideoId: z.string().uuid(),
  inputFormat: TranscriptInputFormat,
  /** Original text exactly as received. Treated as untrusted data everywhere it flows. */
  rawText: z.string().min(1),
  /** Cleaned text after Module 1 (Source Processor) runs. */
  cleanText: z.string().optional(),
  status: TranscriptStatus.default('raw'),
  qualityScore: z.number().min(0).max(1).optional(),
  storageObjectKey: z.string().optional(),
  ...timestamps,
});
export type Transcript = z.infer<typeof TranscriptSchemaV1>;

export const TranscriptSchema = TranscriptSchemaV1;
