import { boolean, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { transcripts } from './transcript';

export const transcriptSegments = pgTable('transcript_segments', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  transcriptId: uuid('transcript_id')
    .notNull()
    .references(() => transcripts.id, { onDelete: 'cascade' }),
  index: integer('index').notNull(),
  sectionTitle: text('section_title'),
  speaker: text('speaker'),
  text: text('text').notNull(),
  startMs: integer('start_ms'),
  endMs: integer('end_ms'),
  isTopicChange: boolean('is_topic_change').notNull().default(false),
  isExample: boolean('is_example').notNull().default(false),
  isPromotional: boolean('is_promotional').notNull().default(false),
  isUnclear: boolean('is_unclear').notNull().default(false),
  ...timestampColumns,
});
