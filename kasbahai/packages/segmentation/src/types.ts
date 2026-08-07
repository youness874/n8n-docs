export interface DraftSegment {
  index: number;
  sectionTitle?: string;
  speaker?: string;
  text: string;
  startMs?: number;
  endMs?: number;
  isTopicChange: boolean;
  isExample: boolean;
  isPromotional: boolean;
  isUnclear: boolean;
}

export interface SegmentationResult {
  segments: DraftSegment[];
  cleanText: string;
  qualityScore: number;
}

export type SegmentationInputFormat = 'plain' | 'srt' | 'vtt';

export interface RawSegment {
  text: string;
  startMs?: number;
  endMs?: number;
}
