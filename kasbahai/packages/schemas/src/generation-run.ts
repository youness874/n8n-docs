import { z } from 'zod';
import { schemaVersion, timestamps, workspaceScoped } from './common';

export const ModuleName = z.enum([
  'source_processor',
  'intelligence_analyst',
  'video_strategist',
  'script_engine',
  'repurposing_engine',
]);

export const GenerationRunStatus = z.enum(['pending', 'running', 'succeeded', 'failed']);

/**
 * One audit record per AI gateway call. Every generation run pins the
 * exact prompt version, output schema version, and model id it used, so a
 * stored result can always be traced back to how it was produced.
 */
export const GenerationRunSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  projectId: z.string().uuid(),
  moduleName: ModuleName,
  status: GenerationRunStatus.default('pending'),
  promptVersion: z.string().min(1),
  outputSchemaVersion: z.string().min(1),
  modelId: z.string().min(1),
  inputRef: z.string().optional(),
  outputRef: z.string().optional(),
  error: z.string().optional(),
  startedAt: z.coerce.date(),
  finishedAt: z.coerce.date().optional(),
  ...timestamps,
});
export type GenerationRun = z.infer<typeof GenerationRunSchemaV1>;

export const GenerationRunSchema = GenerationRunSchemaV1;
