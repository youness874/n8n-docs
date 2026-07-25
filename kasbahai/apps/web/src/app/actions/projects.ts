'use server';

import { redirect } from 'next/navigation';
import { schema } from '@kasbahai/db';
import { getDb } from '@/lib/db';
import { getOrCreateDefaultWorkspace } from '@/lib/workspace';
import { optionalString, requireString } from './form-data';

export async function createProjectAction(formData: FormData): Promise<void> {
  const workspace = await getOrCreateDefaultWorkspace();
  const db = getDb();

  const approximateDurationSeconds = optionalString(formData, 'approximateDurationSeconds');

  const [project] = await db
    .insert(schema.projects)
    .values({
      workspaceId: workspace.id,
      name: requireString(formData, 'name'),
      targetAudience: requireString(formData, 'targetAudience'),
      language: requireString(formData, 'language'),
      tone: requireString(formData, 'tone'),
      objective: requireString(formData, 'objective'),
      approximateDurationSeconds: approximateDurationSeconds
        ? Number(approximateDurationSeconds)
        : undefined,
      userInstructions: optionalString(formData, 'userInstructions'),
    })
    .returning();

  if (!project) {
    throw new Error('Failed to create project');
  }

  redirect(`/projects/${project.id}`);
}
