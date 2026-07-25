import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { brandProfiles } from './brand-profile';

export const projects = pgTable('projects', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  name: text('name').notNull(),
  targetAudience: text('target_audience').notNull(),
  language: text('language').notNull(),
  tone: text('tone').notNull(),
  objective: text('objective').notNull(),
  approximateDurationSeconds: integer('approximate_duration_seconds'),
  brandProfileId: uuid('brand_profile_id').references(() => brandProfiles.id, {
    onDelete: 'set null',
  }),
  userInstructions: text('user_instructions'),
  ...timestampColumns,
});
