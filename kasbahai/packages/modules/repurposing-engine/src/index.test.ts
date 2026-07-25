import { AiGateway, MockProvider } from '@kasbahai/ai-gateway';
import { describe, expect, it } from 'vitest';
import { DefaultRepurposingEngine } from './index';

describe('DefaultRepurposingEngine', () => {
  it('produces validated shorts, carousels, and social posts from an approved master video', async () => {
    const provider = new MockProvider(() =>
      JSON.stringify({
        shorts: [
          {
            conceptType: 'one_powerful_insight',
            title: 'Why most AI agents fail',
            hook: 'Your AI agent probably does not need a better model.',
            script: [
              {
                startSeconds: 0,
                endSeconds: 4,
                voice: 'Your AI agent probably does not need a better model.',
                visual: 'Creator facing camera.',
              },
            ],
            durationSeconds: 38,
            platforms: ['tiktok', 'instagram_reels'],
            caption: 'The model is not the problem.',
            cta: 'Watch the full breakdown.',
            connectionToLongForm: 'Expands on the bounded-agent framework from the full video.',
          },
        ],
        carousels: [],
        socialPosts: [],
      }),
    );
    const engine = new DefaultRepurposingEngine(new AiGateway(provider, 'mock-structured-v1'));

    const bundle = await engine.repurpose({ approvedMasterVideoText: '{}' });

    expect(bundle.shorts).toHaveLength(1);
    expect(bundle.shorts[0]?.title).toBe('Why most AI agents fail');
  });
});
