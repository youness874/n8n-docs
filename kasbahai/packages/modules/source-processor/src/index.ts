import {
  segmentTranscript,
  toSegmentationFormat,
  type SegmentationResult,
} from '@kasbahai/segmentation';

export interface SourceProcessorInput {
  transcriptId: string;
  rawText: string;
  inputFormat: 'pasted' | 'txt' | 'docx' | 'srt' | 'vtt';
}

export type SourceProcessorOutput = SegmentationResult;

/**
 * Module 1. Cleans and structures a transcript into segments, ahead of
 * Module 2 (Intelligence Analyst) reading them. The deterministic parsing
 * and heuristic flagging live in @kasbahai/segmentation; this module is
 * the seam where a future AI-assisted cleanup pass (e.g. smarter section
 * titling) would be added without changing that package's contract.
 */
export interface SourceProcessor {
  process(input: SourceProcessorInput): Promise<SourceProcessorOutput>;
}

export class DefaultSourceProcessor implements SourceProcessor {
  async process(input: SourceProcessorInput): Promise<SourceProcessorOutput> {
    const format = toSegmentationFormat(input.inputFormat);
    return segmentTranscript(input.rawText, format);
  }
}
