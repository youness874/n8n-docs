import { jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';

export const brandProfiles = pgTable('brand_profiles', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  name: text('name').notNull(),
  tone: text('tone').notNull(),
  vocabulary: jsonb('vocabulary').$type<string[]>().notNull().default([]),
  positioning: text('positioning'),
  values: jsonb('values').$type<string[]>().notNull().default([]),
  prohibitedPhrases: jsonb('prohibited_phrases').$type<string[]>().notNull().default([]),
  formattingPreferences: text('formatting_preferences'),
  ...timestampColumns,
});
