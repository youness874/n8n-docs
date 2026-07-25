import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getOrCreateDefaultWorkspace } from '@/lib/workspace';

// Reads live workspace/project state on every request; nothing here is safe to
// prerender at build time.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const workspace = await getOrCreateDefaultWorkspace();
  const db = getDb();
  const projects = await db.query.projects.findMany({
    where: (p, { eq }) => eq(p.workspaceId, workspace.id),
    orderBy: (p, { desc }) => desc(p.createdAt),
  });

  return (
    <section>
      <h1>Projects</h1>
      <p>
        <Link href="/projects/new">+ New project</Link>
      </p>
      {projects.length === 0 ? (
        <p>No projects yet. Start with a YouTube transcript.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={`/projects/${project.id}`}>{project.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
