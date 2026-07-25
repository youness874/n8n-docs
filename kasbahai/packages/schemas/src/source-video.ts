import { z } from 'zod';
import { schemaVersion, timestamps, workspaceScoped } from './common';

export const SourceType = z.enum(['youtube_url', 'pasted_transcript', 'uploaded_file']);

export const SourceVideoSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  projectId: z.string().uuid(),
  sourceType: SourceType,
  youtubeUrl: z.string().url().optional(),
  title: z.string().min(1),
  channelOrCreator: z.string().optional(),
  ...timestamps,
});
export type SourceVideo = z.infer<typeof SourceVideoSchemaV1>;

export const SourceVideoSchema = SourceVideoSchemaV1;
