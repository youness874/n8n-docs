import { createDatabase, type Database } from '@kasbahai/db';

let instance: Database | undefined;

/** One connection pool per process; server components/actions share it. */
export function getDb(): Database {
  instance ??= createDatabase();
  return instance;
}
