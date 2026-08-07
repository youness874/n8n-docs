import { describe, expect, it } from 'vitest';
import { DefaultSourceProcessor } from './index';

describe('DefaultSourceProcessor', () => {
  it('segments a pasted transcript into structured segments', async () => {
    const processor = new DefaultSourceProcessor();
    const result = await processor.process({
      transcriptId: '11111111-1111-4111-8111-111111111111',
      inputFormat: 'pasted',
      rawText: 'First idea explained here.\n\nSecond idea explained here.',
    });

    expect(result.segments).toHaveLength(2);
    expect(result.qualityScore).toBeGreaterThan(0);
  });
});
