import { integer, jsonb, pgTable, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { masterVideos } from './master-video';

type Strategy = {
  targetAudience: string;
  viewerAwarenessLevel: string;
  primaryProblem: string;
  corePromise: string;
  desiredViewerAction: string;
  tone: string;
  contentAngle: string;
};

type Structure = {
  coldOpen?: string;
  hook: string;
  context?: string;
  problem: string;
  mainTeachingSections: string[];
  examples: string[];
  patternInterrupts: string[];
  objectionHandling: string[];
  recap?: string;
  cta: string;
};

type ScriptScene = {
  index: number;
  approximateTimingSeconds?: number;
  narration: string;
  onScreenText?: string;
  bRollSuggestions: string[];
  graphicSuggestions: string[];
  demonstrationInstructions?: string;
  isPatternInterrupt: boolean;
  isRetentionDevice: boolean;
  isCtaPlacement: boolean;
};

type PublishingPackage = {
  titleOptions: string[];
  thumbnailConcepts: string[];
  description: string;
  chapters: { label: string; timestamp: string }[];
  keywords: string[];
  pinnedComment?: string;
  communityTeaser?: string;
  ctaOptions: string[];
};

export const masterVideoVersions = pgTable('master_video_versions', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  masterVideoId: uuid('master_video_id')
    .notNull()
    .references(() => masterVideos.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),

  strategy: jsonb('strategy').$type<Strategy>().notNull(),
  structure: jsonb('structure').$type<Structure>().notNull(),
  script: jsonb('script').$type<ScriptScene[]>().notNull(),
  publishingPackage: jsonb('publishing_package').$type<PublishingPackage>().notNull(),

  ...timestampColumns,
});
