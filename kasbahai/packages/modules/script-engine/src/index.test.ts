import { AiGateway, MockProvider } from '@kasbahai/ai-gateway';
import { describe, expect, it } from 'vitest';
import { DefaultScriptEngine } from './index';

const validDraft = {
  strategy: {
    targetAudience: 'Beginners',
    viewerAwarenessLevel: 'problem-aware',
    primaryProblem: 'Vague agent instructions',
    corePromise: 'Build reliable agents',
    desiredViewerAction: 'Try the framework',
    tone: 'direct',
    contentAngle: 'contrarian_argument',
  },
  structure: {
    hook: 'Your model is not the problem.',
    problem: 'Vague tasks cause failures.',
    mainTeachingSections: ['Bounded Agent Workflow'],
    cta: 'Try it today.',
  },
  script: [
    {
      index: 0,
      narration: 'Your model is not the problem.',
      isPatternInterrupt: false,
      isRetentionDevice: false,
      isCtaPlacement: false,
    },
  ],
  publishingPackage: {
    titleOptions: ['Why Your AI Agent Keeps Failing'],
    description: 'A practical breakdown of bounded agent workflows.',
  },
};

describe('DefaultScriptEngine', () => {
  it('produces a validated master video version draft', async () => {
    const provider = new MockProvider(() => JSON.stringify(validDraft));
    const engine = new DefaultScriptEngine(new AiGateway(provider, 'mock-structured-v1'));

    const draft = await engine.createVersion({ conceptAndIntelligenceText: '{}' });

    expect(draft.structure.hook).toBe('Your model is not the problem.');
    expect(draft.script).toHaveLength(1);
  });
});
