import { schema } from '@kasbahai/db';
import { getDb } from './db';

const DEFAULT_WORKSPACE_SLUG = 'default';

/**
 * Every record is workspace-scoped, but this milestone has no
 * authentication/workspace-switching UI yet. A single default workspace is
 * created on first use so the schema's isolation guarantee is exercised
 * even before multi-tenant UI exists.
 */
export async function getOrCreateDefaultWorkspace() {
  const db = getDb();
  const existing = await db.query.workspaces.findFirst({
    where: (w, { eq }) => eq(w.slug, DEFAULT_WORKSPACE_SLUG),
  });
  if (existing) return existing;

  // Two concurrent callers can both miss the check above; let the unique
  // constraint on slug resolve the race instead of crashing the request.
  const [created] = await db
    .insert(schema.workspaces)
    .values({ name: 'Default Workspace', slug: DEFAULT_WORKSPACE_SLUG })
    .onConflictDoNothing({ target: schema.workspaces.slug })
    .returning();
  if (created) return created;

  const afterConflict = await db.query.workspaces.findFirst({
    where: (w, { eq }) => eq(w.slug, DEFAULT_WORKSPACE_SLUG),
  });
  if (!afterConflict) {
    throw new Error('Failed to create default workspace');
  }
  return afterConflict;
}
