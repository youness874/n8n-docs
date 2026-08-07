import { integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { shortVideoConceptTypeEnum } from './enums';
import { masterVideos } from './master-video';
import { masterVideoVersions } from './master-video-version';

type ScriptBeat = {
  startSeconds: number;
  endSeconds: number;
  voice: string;
  visual: string;
  onScreenText?: string;
};

export const shortVideos = pgTable('short_videos', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  masterVideoId: uuid('master_video_id')
    .notNull()
    .references(() => masterVideos.id, { onDelete: 'cascade' }),
  masterVideoVersionId: uuid('master_video_version_id')
    .notNull()
    .references(() => masterVideoVersions.id, { onDelete: 'cascade' }),

  conceptType: shortVideoConceptTypeEnum('concept_type').notNull(),
  title: text('title').notNull(),
  hook: text('hook').notNull(),
  script: jsonb('script').$type<ScriptBeat[]>().notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  platforms: jsonb('platforms').$type<string[]>().notNull(),
  caption: text('caption').notNull(),
  cta: text('cta').notNull(),
  connectionToLongForm: text('connection_to_long_form').notNull(),

  ...timestampColumns,
});
