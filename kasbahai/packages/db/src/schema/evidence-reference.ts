import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { transcriptSegments } from './transcript-segment';

export const evidenceReferences = pgTable('evidence_references', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  transcriptSegmentId: uuid('transcript_segment_id')
    .notNull()
    .references(() => transcriptSegments.id, { onDelete: 'cascade' }),
  quote: text('quote').notNull(),
  note: text('note'),
  ...timestampColumns,
});
