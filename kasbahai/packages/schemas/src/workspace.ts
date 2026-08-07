import { z } from 'zod';
import { schemaVersion, timestamps } from './common';

export const WorkspaceSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  ...timestamps,
});
export type Workspace = z.infer<typeof WorkspaceSchemaV1>;

export const WorkspaceSchema = WorkspaceSchemaV1;
