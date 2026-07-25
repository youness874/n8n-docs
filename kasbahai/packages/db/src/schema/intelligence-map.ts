import { jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { knowledgeLevelEnum } from './enums';
import { projects } from './project';
import { transcripts } from './transcript';

type Framework = { name: string; steps: string[] };
type ClaimWithEvidence = { statement: string; evidenceReferenceIds: string[] };

export const sourceIntelligenceMaps = pgTable('source_intelligence_maps', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  transcriptId: uuid('transcript_id')
    .notNull()
    .references(() => transcripts.id, { onDelete: 'cascade' }),

  coreThesis: text('core_thesis').notNull(),
  audiencePrimary: text('audience_primary').notNull(),
  audienceKnowledgeLevel: knowledgeLevelEnum('audience_knowledge_level').notNull(),
  desiredTransformation: text('desired_transformation').notNull(),

  problems: jsonb('problems').$type<string[]>().notNull().default([]),
  frameworks: jsonb('frameworks').$type<Framework[]>().notNull().default([]),
  processes: jsonb('processes').$type<string[]>().notNull().default([]),
  argumentsList: jsonb('arguments_list').$type<ClaimWithEvidence[]>().notNull().default([]),
  examples: jsonb('examples').$type<string[]>().notNull().default([]),
  stories: jsonb('stories').$type<string[]>().notNull().default([]),
  analogies: jsonb('analogies').$type<string[]>().notNull().default([]),
  objections: jsonb('objections').$type<string[]>().notNull().default([]),
  psychologicalTriggers: jsonb('psychological_triggers').$type<string[]>().notNull().default([]),
  teachingSequence: jsonb('teaching_sequence').$type<string[]>().notNull().default([]),
  quotations: jsonb('quotations').$type<ClaimWithEvidence[]>().notNull().default([]),
  weakOrUnsupportedClaims: jsonb('weak_or_unsupported_claims')
    .$type<ClaimWithEvidence[]>()
    .notNull()
    .default([]),
  missingExplanations: jsonb('missing_explanations').$type<string[]>().notNull().default([]),
  contentGaps: jsonb('content_gaps').$type<string[]>().notNull().default([]),
  improvementOpportunities: jsonb('improvement_opportunities')
    .$type<string[]>()
    .notNull()
    .default([]),

  ...timestampColumns,
});
