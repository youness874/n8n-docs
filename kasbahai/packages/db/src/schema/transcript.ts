import { pgTable, real, text, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { transcriptInputFormatEnum, transcriptStatusEnum } from './enums';
import { projects } from './project';
import { sourceVideos } from './source-video';

export const transcripts = pgTable('transcripts', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  sourceVideoId: uuid('source_video_id')
    .notNull()
    .references(() => sourceVideos.id, { onDelete: 'cascade' }),
  inputFormat: transcriptInputFormatEnum('input_format').notNull(),
  // Raw text is treated as untrusted data: it is never interpolated into a
  // model instruction directly, only passed as delimited input content.
  rawText: text('raw_text').notNull(),
  cleanText: text('clean_text'),
  status: transcriptStatusEnum('status').notNull().default('raw'),
  qualityScore: real('quality_score'),
  storageObjectKey: text('storage_object_key'),
  ...timestampColumns,
});
