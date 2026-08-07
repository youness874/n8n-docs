import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { generationRunStatusEnum, moduleNameEnum } from './enums';
import { projects } from './project';

export const generationRuns = pgTable('generation_runs', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  moduleName: moduleNameEnum('module_name').notNull(),
  status: generationRunStatusEnum('status').notNull().default('pending'),
  promptVersion: text('prompt_version').notNull(),
  outputSchemaVersion: text('output_schema_version').notNull(),
  modelId: text('model_id').notNull(),
  inputRef: text('input_ref'),
  outputRef: text('output_ref'),
  error: text('error'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  ...timestampColumns,
});
