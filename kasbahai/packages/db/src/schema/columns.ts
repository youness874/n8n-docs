import { timestamp, uuid } from 'drizzle-orm/pg-core';
import { workspaces } from './workspace';

/** Every table carries these two columns: an id and a workspace scope. */
export const idColumn = () => uuid('id').primaryKey().defaultRandom();

export const workspaceIdColumn = () =>
  uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' });

export const timestampColumns = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};
