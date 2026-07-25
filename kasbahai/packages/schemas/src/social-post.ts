import { z } from 'zod';
import { Platform, schemaVersion, timestamps, workspaceScoped } from './common';

export const SocialPostType = z.enum([
  'linkedin_insight',
  'linkedin_lesson',
  'instagram_caption',
  'x_single',
  'x_thread',
]);

/**
 * Generated from an approved MasterVideo. Platform adapters must produce
 * genuinely native writing for the same underlying intelligence, not one
 * post reflowed three ways.
 */
export const SocialPostSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  masterVideoId: z.string().uuid(),
  masterVideoVersionId: z.string().uuid(),
  platform: Platform,
  postType: SocialPostType,
  content: z.string().min(1),
  threadParts: z.array(z.string().min(1)).optional(),
  cta: z.string().optional(),
  ...timestamps,
});
export type SocialPost = z.infer<typeof SocialPostSchemaV1>;

export const SocialPostSchema = SocialPostSchemaV1;
