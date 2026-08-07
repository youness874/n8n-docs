import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

export type Database = ReturnType<typeof createDatabase>;

/**
 * Every consumer gets a db handle through this factory rather than
 * importing a shared singleton, so tests can point at an isolated
 * connection string without module-level state leaking between them.
 */
export function createDatabase(connectionString: string = requireDatabaseUrl()) {
  const client = postgres(connectionString, { max: 10 });
  return drizzle(client, { schema });
}

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set. Copy kasbahai/.env.example to .env.local.');
  }
  return url;
}
