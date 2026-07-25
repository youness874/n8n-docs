import { z } from 'zod';
import { KnowledgeLevel, schemaVersion, timestamps, workspaceScoped } from './common';

const FrameworkSchema = z.object({
  name: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
});

const claimWithEvidence = z.object({
  statement: z.string().min(1),
  evidenceReferenceIds: z.array(z.string().uuid()).default([]),
});

/**
 * The single Source Intelligence Map produced by Module 2 (Intelligence
 * Analyst). Downstream modules (Video Strategist, Script Engine,
 * Repurposing Engine) read from this object, never from the raw
 * transcript directly.
 */
export const SourceIntelligenceMapSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  projectId: z.string().uuid(),
  transcriptId: z.string().uuid(),

  coreThesis: z.string().min(1),
  audience: z.object({
    primary: z.string().min(1),
    knowledgeLevel: KnowledgeLevel,
  }),
  desiredTransformation: z.string().min(1),

  problems: z.array(z.string().min(1)).default([]),
  frameworks: z.array(FrameworkSchema).default([]),
  processes: z.array(z.string().min(1)).default([]),
  argumentsList: z.array(claimWithEvidence).default([]),
  examples: z.array(z.string().min(1)).default([]),
  stories: z.array(z.string().min(1)).default([]),
  analogies: z.array(z.string().min(1)).default([]),
  objections: z.array(z.string().min(1)).default([]),
  psychologicalTriggers: z.array(z.string().min(1)).default([]),
  teachingSequence: z.array(z.string().min(1)).default([]),
  quotations: z.array(claimWithEvidence).default([]),
  weakOrUnsupportedClaims: z.array(claimWithEvidence).default([]),
  missingExplanations: z.array(z.string().min(1)).default([]),
  contentGaps: z.array(z.string().min(1)).default([]),
  improvementOpportunities: z.array(z.string().min(1)).default([]),

  ...timestamps,
});
export type SourceIntelligenceMap = z.infer<typeof SourceIntelligenceMapSchemaV1>;

export const SourceIntelligenceMapSchema = SourceIntelligenceMapSchemaV1;
