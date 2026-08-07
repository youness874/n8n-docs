import { AiGateway, MockProvider } from '@kasbahai/ai-gateway';
import { describe, expect, it } from 'vitest';
import { DefaultIntelligenceAnalyst } from './index';

describe('DefaultIntelligenceAnalyst', () => {
  it('validates the provider response against the intelligence map draft schema', async () => {
    const provider = new MockProvider(() =>
      JSON.stringify({
        coreThesis: 'AI agents fail when tasks are not clearly bounded.',
        audience: { primary: 'Small business owners', knowledgeLevel: 'mixed' },
        desiredTransformation: 'From vague prompts to reliable workflows.',
        frameworks: [{ name: 'Bounded Agent Workflow', steps: ['Define one objective'] }],
      }),
    );
    const analyst = new DefaultIntelligenceAnalyst(new AiGateway(provider, 'mock-structured-v1'));

    const result = await analyst.analyze({ cleanTranscriptText: 'transcript text' });

    expect(result.coreThesis).toContain('bounded');
    expect(result.frameworks[0]?.name).toBe('Bounded Agent Workflow');
    expect(result.problems).toEqual([]);
  });

  it('rejects a provider response missing the required core thesis', async () => {
    const provider = new MockProvider(() =>
      JSON.stringify({
        audience: { primary: 'x', knowledgeLevel: 'beginner' },
        desiredTransformation: 'x',
      }),
    );
    const analyst = new DefaultIntelligenceAnalyst(new AiGateway(provider, 'mock-structured-v1'));

    await expect(analyst.analyze({ cleanTranscriptText: 'x' })).rejects.toThrow();
  });
});
