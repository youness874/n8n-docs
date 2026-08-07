import {
  collapseRepeatedWords,
  containsExample,
  extractSpeaker,
  isPromotional,
  isUnclear,
  jaccardSimilarity,
  TOPIC_CHANGE_THRESHOLD,
} from './heuristics';
import { parseSrt } from './parse-srt';
import { parseVtt } from './parse-vtt';
import { segmentPlainText } from './segment-plain-text';
import type {
  DraftSegment,
  RawSegment,
  SegmentationInputFormat,
  SegmentationResult,
} from './types';

/**
 * Maps a Transcript's stored input format to the parser this package knows
 * how to run. .docx is extracted to plain text before it reaches this
 * package (see apps/web's upload handler) — segmentation never parses the
 * binary format itself.
 */
export function toSegmentationFormat(
  inputFormat: 'pasted' | 'txt' | 'docx' | 'srt' | 'vtt',
): SegmentationInputFormat {
  if (inputFormat === 'srt') return 'srt';
  if (inputFormat === 'vtt') return 'vtt';
  return 'plain';
}

/**
 * Module 1 (Source Processor)'s deterministic first pass: parses the raw
 * transcript into ordered segments, preserves timestamps where the source
 * format has them, and flags promotional/unclear/example content. This
 * runs before the AI-driven cleanup the module also performs.
 */
export function segmentTranscript(
  rawText: string,
  format: SegmentationInputFormat,
): SegmentationResult {
  const raw = parseRaw(rawText, format);
  const segments = annotate(raw);
  const cleanText = segments
    .filter((segment) => !segment.isPromotional)
    .map((segment) => segment.text)
    .join('\n\n');

  return {
    segments,
    cleanText,
    qualityScore: computeQualityScore(segments),
  };
}

function parseRaw(rawText: string, format: SegmentationInputFormat): RawSegment[] {
  switch (format) {
    case 'srt':
      return parseSrt(rawText);
    case 'vtt':
      return parseVtt(rawText);
    case 'plain':
      return segmentPlainText(rawText);
  }
}

function annotate(raw: RawSegment[]): DraftSegment[] {
  let previousText: string | undefined;

  return raw.map((segment, index): DraftSegment => {
    const { speaker, text: withoutSpeaker } = extractSpeaker(segment.text);
    const text = collapseRepeatedWords(withoutSpeaker);

    const isTopicChange =
      index > 0 &&
      previousText !== undefined &&
      jaccardSimilarity(previousText, text) < TOPIC_CHANGE_THRESHOLD;
    previousText = text;

    return {
      index,
      speaker,
      text,
      startMs: segment.startMs,
      endMs: segment.endMs,
      isTopicChange,
      isExample: containsExample(text),
      isPromotional: isPromotional(text),
      isUnclear: isUnclear(text),
    };
  });
}

/**
 * A simple, explainable 0-1 score: penalizes a transcript for unclear
 * passages and heavy promotional content. Not a substitute for the
 * AI-driven quality review in later milestones, just a first signal.
 */
function computeQualityScore(segments: DraftSegment[]): number {
  if (segments.length === 0) return 0;

  const unclearRatio = segments.filter((s) => s.isUnclear).length / segments.length;
  const promotionalRatio = segments.filter((s) => s.isPromotional).length / segments.length;

  const score = 1 - unclearRatio * 0.5 - promotionalRatio * 0.2;
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}
