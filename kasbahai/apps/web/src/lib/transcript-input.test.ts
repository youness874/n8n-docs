import { describe, expect, it } from 'vitest';
import { detectFormatFromFilename } from './transcript-input';

describe('detectFormatFromFilename', () => {
  it.each([
    ['lesson.txt', 'txt'],
    ['lesson.docx', 'docx'],
    ['lesson.srt', 'srt'],
    ['lesson.vtt', 'vtt'],
    ['LESSON.SRT', 'srt'],
  ])('maps %s to %s', (filename, expected) => {
    expect(detectFormatFromFilename(filename)).toBe(expected);
  });

  it('rejects an unsupported extension', () => {
    expect(() => detectFormatFromFilename('lesson.pdf')).toThrow(
      'Unsupported transcript file type',
    );
  });
});
