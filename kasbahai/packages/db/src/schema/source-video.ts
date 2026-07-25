import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { sourceTypeEnum } from './enums';
import { projects } from './project';

export const sourceVideos = pgTable('source_videos', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  sourceType: sourceTypeEnum('source_type').notNull(),
  youtubeUrl: text('youtube_url'),
  title: text('title').notNull(),
  channelOrCreator: text('channel_or_creator'),
  ...timestampColumns,
});
