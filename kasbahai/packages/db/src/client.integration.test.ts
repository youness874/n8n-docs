import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as schema from './schema/index';

/**
 * Requires a reachable Postgres at DATABASE_URL (see kasbahai/.env.example
 * and the docker-compose service in kasbahai/README.md). Skipped
 * automatically when DATABASE_URL is unset so `pnpm test` stays DB-free.
 */
const connectionString = process.env.DATABASE_URL;
const describeIfDb = connectionString ? describe : describe.skip;

describeIfDb('db integration', () => {
  const client = postgres(connectionString as string, { max: 1 });
  const db = drizzle(client, { schema });

  beforeAll(async () => {
    await migrate(db, { migrationsFolder: new URL('../migrations', import.meta.url).pathname });
  });

  afterAll(async () => {
    await client.end();
  });

  it('round-trips a workspace and a project scoped to it', async () => {
    const [workspace] = await db
      .insert(schema.workspaces)
      .values({ name: 'Test Workspace', slug: `test-${Date.now()}` })
      .returning();

    const [project] = await db
      .insert(schema.projects)
      .values({
        workspaceId: workspace!.id,
        name: 'My Project',
        targetAudience: 'Beginners',
        language: 'en',
        tone: 'friendly',
        objective: 'educate',
      })
      .returning();

    expect(project?.workspaceId).toBe(workspace!.id);

    const found = await db.query.projects.findFirst({
      where: (p, { eq }) => eq(p.id, project!.id),
    });
    expect(found?.name).toBe('My Project');
  });
});
