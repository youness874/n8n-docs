import { z } from 'zod';
import { schemaVersion, timestamps, workspaceScoped } from './common';

export const MasterVideoStatus = z.enum(['draft', 'in_review', 'approved', 'rejected']);

/**
 * The video becomes the single source of truth once its current version is
 * approved. Only an approved MasterVideo may feed the Repurposing Engine.
 */
export const MasterVideoSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  projectId: z.string().uuid(),
  videoConceptId: z.string().uuid(),
  status: MasterVideoStatus.default('draft'),
  currentVersionId: z.string().uuid().optional(),
  approvedVersionId: z.string().uuid().optional(),
  ...timestamps,
});
export type MasterVideo = z.infer<typeof MasterVideoSchemaV1>;

export const MasterVideoSchema = MasterVideoSchemaV1;
