import { boolean, integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { originalityRiskEnum, videoAngleTypeEnum } from './enums';
import { projects } from './project';
import { sourceIntelligenceMaps } from './intelligence-map';

export const videoConcepts = pgTable('video_concepts', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  intelligenceMapId: uuid('intelligence_map_id')
    .notNull()
    .references(() => sourceIntelligenceMaps.id, { onDelete: 'cascade' }),

  angleType: videoAngleTypeEnum('angle_type').notNull(),
  angleName: text('angle_name').notNull(),
  centralPromise: text('central_promise').notNull(),
  targetViewer: text('target_viewer').notNull(),
  whyDifferent: text('why_different').notNull(),
  retainedIntelligence: jsonb('retained_intelligence').$type<string[]>().notNull().default([]),
  newValueAdded: jsonb('new_value_added').$type<string[]>().notNull().default([]),
  proposedStructure: jsonb('proposed_structure').$type<string[]>().notNull(),
  originalityRisk: originalityRiskEnum('originality_risk').notNull(),
  estimatedStrength: integer('estimated_strength').notNull(),
  recommended: boolean('recommended').notNull().default(false),
  selected: boolean('selected').notNull().default(false),

  ...timestampColumns,
});
