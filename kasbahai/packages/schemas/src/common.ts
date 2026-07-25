import { z } from 'zod';

/**
 * Every generated/stored record is versioned. `schemaVersion` is a literal
 * per major shape so a stored record's version can be checked before it is
 * trusted, and so migrations can target a specific version explicitly.
 */
export function schemaVersion<V extends number>(version: V) {
  return z.literal(version).default(version);
}

/** Every table row belongs to exactly one workspace. */
export const workspaceScoped = {
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
};

export const timestamps = {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
};

export const KnowledgeLevel = z.enum(['beginner', 'intermediate', 'advanced', 'mixed']);

export const Platform = z.enum([
  'youtube',
  'youtube_shorts',
  'tiktok',
  'instagram_reels',
  'instagram',
  'linkedin',
  'x',
  'pinterest',
]);

export const OriginalityRisk = z.enum(['low', 'medium', 'high']);

/**
 * Wraps a schema in a discriminated-union-friendly "envelope" carrying the
 * prompt/schema/model versions a generation run used to produce it. Used by
 * the AI gateway so every structured output is traceable after the fact.
 */
export function generatedEnvelope<T extends z.ZodTypeAny>(payload: T) {
  return z.object({
    promptVersion: z.string(),
    schemaVersion: z.string(),
    modelId: z.string(),
    generatedAt: z.coerce.date(),
    payload,
  });
}
