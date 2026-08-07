import { z } from 'zod';
import { schemaVersion, timestamps, workspaceScoped } from './common';

export const ProjectSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  name: z.string().min(1),
  targetAudience: z.string().min(1),
  language: z.string().min(2),
  tone: z.string().min(1),
  objective: z.string().min(1),
  approximateDurationSeconds: z.number().int().positive().optional(),
  brandProfileId: z.string().uuid().optional(),
  userInstructions: z.string().optional(),
  ...timestamps,
});
export type Project = z.infer<typeof ProjectSchemaV1>;

export const ProjectSchema = ProjectSchemaV1;
