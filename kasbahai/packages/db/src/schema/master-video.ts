import { pgTable, uuid, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { masterVideoStatusEnum } from './enums';
import { projects } from './project';
import { videoConcepts } from './video-concept';
// Circular with master-video-version.ts (which references masterVideos back).
// Safe here: .references() takes a callback, only invoked lazily by Drizzle
// long after both modules have finished initializing.
import { masterVideoVersions } from './master-video-version';

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
  currentVersionId: uuid('current_version_id').references(
    (): AnyPgColumn => masterVideoVersions.id,
    { onDelete: 'set null' },
  ),
  approvedVersionId: uuid('approved_version_id').references(
    (): AnyPgColumn => masterVideoVersions.id,
    { onDelete: 'set null' },
  ),
  ...timestampColumns,
});
