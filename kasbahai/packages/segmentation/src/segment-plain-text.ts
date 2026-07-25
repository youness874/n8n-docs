import type { RawSegment } from './types';

/** Splits pasted/plain-text transcripts into paragraphs. No timestamps available. */
export function segmentPlainText(rawText: string): RawSegment[] {
  return rawText
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, ' ').trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((text) => ({ text }));
}
