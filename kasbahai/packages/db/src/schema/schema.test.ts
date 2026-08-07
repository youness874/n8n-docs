import { getTableColumns } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { projects, transcripts, workspaces } from './index';

describe('drizzle schema', () => {
  it('scopes every non-workspace table to a workspace_id column', () => {
    expect(Object.keys(getTableColumns(projects))).toContain('workspaceId');
    expect(Object.keys(getTableColumns(transcripts))).toContain('workspaceId');
  });

  it('defines the workspaces table with a unique slug', () => {
    const columns = getTableColumns(workspaces);
    expect(columns.slug.notNull).toBe(true);
  });
});
