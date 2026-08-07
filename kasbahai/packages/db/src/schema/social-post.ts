import { jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { platformEnum, socialPostTypeEnum } from './enums';
import { masterVideos } from './master-video';
import { masterVideoVersions } from './master-video-version';

export const socialPosts = pgTable('social_posts', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  masterVideoId: uuid('master_video_id')
    .notNull()
    .references(() => masterVideos.id, { onDelete: 'cascade' }),
  masterVideoVersionId: uuid('master_video_version_id')
    .notNull()
    .references(() => masterVideoVersions.id, { onDelete: 'cascade' }),
  platform: platformEnum('platform').notNull(),
  postType: socialPostTypeEnum('post_type').notNull(),
  content: text('content').notNull(),
  threadParts: jsonb('thread_parts').$type<string[]>(),
  cta: text('cta'),
  ...timestampColumns,
});
