import { z } from 'zod';
import { schemaVersion, timestamps, workspaceScoped } from './common';

export const BrandProfileSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  name: z.string().min(1),
  tone: z.string().min(1),
  vocabulary: z.array(z.string()).default([]),
  positioning: z.string().optional(),
  values: z.array(z.string()).default([]),
  prohibitedPhrases: z.array(z.string()).default([]),
  formattingPreferences: z.string().optional(),
  ...timestamps,
});
export type BrandProfile = z.infer<typeof BrandProfileSchemaV1>;

export const BrandProfileSchema = BrandProfileSchemaV1;
