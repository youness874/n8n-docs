import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Copy kasbahai/.env.example to .env.local.');
}

const migrationClient = postgres(connectionString, { max: 1 });
const db = drizzle(migrationClient);

await migrate(db, { migrationsFolder: new URL('../migrations', import.meta.url).pathname });
await migrationClient.end();

console.log('Migrations applied.');
