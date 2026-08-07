import { z } from 'zod';
import { schemaVersion, timestamps, workspaceScoped } from './common';

const strategySchema = z.object({
  targetAudience: z.string().min(1),
  viewerAwarenessLevel: z.string().min(1),
  primaryProblem: z.string().min(1),
  corePromise: z.string().min(1),
  desiredViewerAction: z.string().min(1),
  tone: z.string().min(1),
  contentAngle: z.string().min(1),
});

const structureSchema = z.object({
  coldOpen: z.string().optional(),
  hook: z.string().min(1),
  context: z.string().optional(),
  problem: z.string().min(1),
  mainTeachingSections: z.array(z.string().min(1)).min(1),
  examples: z.array(z.string().min(1)).default([]),
  patternInterrupts: z.array(z.string().min(1)).default([]),
  objectionHandling: z.array(z.string().min(1)).default([]),
  recap: z.string().optional(),
  cta: z.string().min(1),
});

const scriptSceneSchema = z.object({
  index: z.number().int().nonnegative(),
  approximateTimingSeconds: z.number().nonnegative().optional(),
  narration: z.string().min(1),
  onScreenText: z.string().optional(),
  bRollSuggestions: z.array(z.string()).default([]),
  graphicSuggestions: z.array(z.string()).default([]),
  demonstrationInstructions: z.string().optional(),
  isPatternInterrupt: z.boolean().default(false),
  isRetentionDevice: z.boolean().default(false),
  isCtaPlacement: z.boolean().default(false),
});

const publishingPackageSchema = z.object({
  titleOptions: z.array(z.string().min(1)).min(1),
  thumbnailConcepts: z.array(z.string().min(1)).default([]),
  description: z.string().min(1),
  chapters: z.array(z.object({ label: z.string().min(1), timestamp: z.string() })).default([]),
  keywords: z.array(z.string()).default([]),
  pinnedComment: z.string().optional(),
  communityTeaser: z.string().optional(),
  ctaOptions: z.array(z.string()).default([]),
});

/**
 * One immutable version of a Master Video. New edits create a new version
 * rather than mutating an existing one, so the approval history and every
 * generation run behind a given version stay reconstructable.
 */
export const MasterVideoVersionSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  masterVideoId: z.string().uuid(),
  versionNumber: z.number().int().positive(),

  strategy: strategySchema,
  structure: structureSchema,
  script: z.array(scriptSceneSchema).min(1),
  publishingPackage: publishingPackageSchema,

  ...timestamps,
});
export type MasterVideoVersion = z.infer<typeof MasterVideoVersionSchemaV1>;

export const MasterVideoVersionSchema = MasterVideoVersionSchemaV1;
