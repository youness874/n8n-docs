import { z } from 'zod';
import { OriginalityRisk, schemaVersion, timestamps, workspaceScoped } from './common';

export const VideoAngleType = z.enum([
  'beginner_explanation',
  'contrarian_argument',
  'step_by_step_implementation',
  'case_study',
  'myth_vs_reality',
  'failure_analysis',
  'transformation_story',
  'comparison',
]);

/**
 * One candidate original angle produced by Module 3 (Video Strategist)
 * during the "Reinvent" step. The user (or KasbahAI) selects one of these
 * to move forward into Master Video creation.
 */
export const VideoConceptSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  projectId: z.string().uuid(),
  intelligenceMapId: z.string().uuid(),

  angleType: VideoAngleType,
  angleName: z.string().min(1),
  centralPromise: z.string().min(1),
  targetViewer: z.string().min(1),
  whyDifferent: z.string().min(1),
  retainedIntelligence: z.array(z.string().min(1)).default([]),
  newValueAdded: z.array(z.string().min(1)).default([]),
  proposedStructure: z.array(z.string().min(1)).min(1),
  originalityRisk: OriginalityRisk,
  estimatedStrength: z.number().int().min(1).max(5),
  recommended: z.boolean().default(false),
  selected: z.boolean().default(false),

  ...timestamps,
});
export type VideoConcept = z.infer<typeof VideoConceptSchemaV1>;

export const VideoConceptSchema = VideoConceptSchemaV1;
