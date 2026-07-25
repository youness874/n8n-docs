import { describe, expect, it } from 'vitest';
import { SourceIntelligenceMapSchema } from './intelligence-map';

const baseIds = {
  id: '11111111-1111-4111-8111-111111111111',
  workspaceId: '22222222-2222-4222-8222-222222222222',
  projectId: '33333333-3333-4333-8333-333333333333',
  transcriptId: '44444444-4444-4444-8444-444444444444',
};

describe('SourceIntelligenceMapSchema', () => {
  it('accepts a fully populated intelligence map', () => {
    const result = SourceIntelligenceMapSchema.safeParse({
      schemaVersion: 1,
      ...baseIds,
      coreThesis: 'AI agents fail when tasks are not clearly bounded.',
      audience: {
        primary: 'Small business owners learning automation',
        knowledgeLevel: 'mixed',
      },
      desiredTransformation: 'Go from vague prompts to reliable bounded workflows.',
      problems: ['Users give agents vague instructions', 'Workflows lack validation'],
      frameworks: [
        {
          name: 'Bounded Agent Workflow',
          steps: ['Define one objective', 'Define inputs', 'Define output schema'],
        },
      ],
      contentGaps: ['No practical implementation example'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(result.success).toBe(true);
  });

  it('defaults optional arrays and applies the schema version literal', () => {
    const result = SourceIntelligenceMapSchema.parse({
      ...baseIds,
      coreThesis: 'x',
      audience: { primary: 'x', knowledgeLevel: 'beginner' },
      desiredTransformation: 'x',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(result.schemaVersion).toBe(1);
    expect(result.problems).toEqual([]);
    expect(result.frameworks).toEqual([]);
  });

  it('rejects a record missing the required core thesis', () => {
    const result = SourceIntelligenceMapSchema.safeParse({
      ...baseIds,
      audience: { primary: 'x', knowledgeLevel: 'beginner' },
      desiredTransformation: 'x',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(result.success).toBe(false);
  });

  it('rejects an unrecognized schema version rather than silently upgrading it', () => {
    const result = SourceIntelligenceMapSchema.safeParse({
      schemaVersion: 2,
      ...baseIds,
      coreThesis: 'x',
      audience: { primary: 'x', knowledgeLevel: 'beginner' },
      desiredTransformation: 'x',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(result.success).toBe(false);
  });
});
