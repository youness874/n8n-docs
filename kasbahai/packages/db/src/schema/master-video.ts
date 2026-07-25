import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { masterVideoStatusEnum } from './enums';
import { projects } from './project';
import { videoConcepts } from './video-concept';

export const masterVideos = pgTable('master_videos', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  videoConceptId: uuid('video_concept_id')
    .notNull()
    .references(() => videoConcepts.id, { onDelete: 'restrict' }),
  status: masterVideoStatusEnum('status').notNull().default('draft'),
  // Nullable self-references to versions; FK added after master_video_versions
  // exists (see migrations) to avoid a circular table-creation order.
  currentVersionId: uuid('current_version_id'),
  approvedVersionId: uuid('approved_version_id'),
  ...timestampColumns,
});
