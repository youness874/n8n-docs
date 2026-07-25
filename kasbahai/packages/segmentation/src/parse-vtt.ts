import { parseTimestampToMs } from './time';
import type { RawSegment } from './types';

const TIMING_LINE = /-->/;

export function parseVtt(rawText: string): RawSegment[] {
  const withoutHeader = rawText.replace(/\r\n/g, '\n').replace(/^WEBVTT[^\n]*\n?/, '');
  const blocks = withoutHeader.split(/\n{2,}/);
  const segments: RawSegment[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').filter((line) => line.trim().length > 0);
    if (lines.length === 0) continue;

    const timingLineIndex = lines.findIndex((line) => TIMING_LINE.test(line));
    if (timingLineIndex === -1) continue;

    const [startRaw, endRaw] = lines[timingLineIndex]!.split('-->');
    const text = lines
      .slice(timingLineIndex + 1)
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .trim();
    if (!text) continue;

    segments.push({
      text,
      startMs: parseTimestampToMs(startRaw!),
      endMs: parseTimestampToMs(endRaw!.trim().split(/\s+/)[0] ?? endRaw!),
    });
  }

  return segments;
}
