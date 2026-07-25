import { boolean, jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { qualityReviewTypeEnum } from './enums';
import { masterVideoVersions } from './master-video-version';

type Finding = {
  severity: 'info' | 'warning' | 'blocking';
  message: string;
  relatedSceneIndex?: number;
};

export const qualityReviews = pgTable('quality_reviews', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  masterVideoVersionId: uuid('master_video_version_id')
    .notNull()
    .references(() => masterVideoVersions.id, { onDelete: 'cascade' }),
  reviewType: qualityReviewTypeEnum('review_type').notNull(),
  passed: boolean('passed').notNull(),
  findings: jsonb('findings').$type<Finding[]>().notNull().default([]),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }).notNull(),
  ...timestampColumns,
});
