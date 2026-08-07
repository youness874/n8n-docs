import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { platformEnum } from './enums';
import { masterVideos } from './master-video';
import { masterVideoVersions } from './master-video-version';

export const carousels = pgTable('carousels', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  masterVideoId: uuid('master_video_id')
    .notNull()
    .references(() => masterVideos.id, { onDelete: 'cascade' }),
  masterVideoVersionId: uuid('master_video_version_id')
    .notNull()
    .references(() => masterVideoVersions.id, { onDelete: 'cascade' }),
  platform: platformEnum('platform').notNull(),
  title: text('title').notNull(),
  slideCount: integer('slide_count').notNull(),
  ...timestampColumns,
});
