import { AiGateway, MockProvider } from '@kasbahai/ai-gateway';
import { describe, expect, it } from 'vitest';
import { DefaultVideoStrategist } from './index';

describe('DefaultVideoStrategist', () => {
  it('returns the list of proposed concepts from a validated provider response', async () => {
    const provider = new MockProvider(() =>
      JSON.stringify({
        concepts: [
          {
            angleType: 'contrarian_argument',
            angleName: 'Your model is not the problem',
            centralPromise: 'Reliability comes from bounded tasks, not bigger models.',
            targetViewer: 'Builders frustrated with flaky agents',
            whyDifferent: 'Source treats model choice as the fix; this flips it.',
            proposedStructure: ['Hook', 'Reframe', 'Framework', 'CTA'],
            originalityRisk: 'low',
            estimatedStrength: 4,
          },
        ],
      }),
    );
    const strategist = new DefaultVideoStrategist(new AiGateway(provider, 'mock-structured-v1'));

    const concepts = await strategist.proposeAngles({ intelligenceMapText: '{}' });

    expect(concepts).toHaveLength(1);
    expect(concepts[0]?.angleType).toBe('contrarian_argument');
  });
});
