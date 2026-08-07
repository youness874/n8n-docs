import { describe, expect, it } from 'vitest';
import { segmentTranscript } from './segment-transcript';

describe('segmentTranscript - plain text', () => {
  it('splits paragraphs into segments and strips a speaker prefix', () => {
    const rawText = [
      'John: Welcome to the show, today we talk about bounded agents.',
      '',
      'Guest: Thanks for having me, glad to be here.',
    ].join('\n');

    const result = segmentTranscript(rawText, 'plain');

    expect(result.segments).toHaveLength(2);
    expect(result.segments[0]?.speaker).toBe('John');
    expect(result.segments[0]?.text).toContain('bounded agents');
    expect(result.segments[1]?.speaker).toBe('Guest');
  });

  it('collapses immediately repeated words from caption artifacts', () => {
    const result = segmentTranscript('The the model is is not the problem here.', 'plain');
    expect(result.segments[0]?.text).toBe('The model is not the problem here.');
  });

  it('flags promotional segments and excludes them from the clean text', () => {
    const rawText = [
      'This section explains the core framework in detail.',
      '',
      'This video is sponsored by our friends, use code SAVE20 for 20% off.',
    ].join('\n');

    const result = segmentTranscript(rawText, 'plain');

    expect(result.segments[1]?.isPromotional).toBe(true);
    expect(result.cleanText).not.toContain('SAVE20');
    expect(result.cleanText).toContain('core framework');
  });

  it('flags unclear passages', () => {
    const result = segmentTranscript(
      'Something happened here [inaudible] and then it worked.',
      'plain',
    );
    expect(result.segments[0]?.isUnclear).toBe(true);
  });

  it('flags segments containing worked examples', () => {
    const result = segmentTranscript('For example, imagine you have ten customers a day.', 'plain');
    expect(result.segments[0]?.isExample).toBe(true);
  });

  it('produces a lower quality score when unclear/promotional content dominates', () => {
    const clean = segmentTranscript(
      'This is a clear explanation.\n\nAnother clear explanation follows.',
      'plain',
    );
    const messy = segmentTranscript(
      '[inaudible] [inaudible]\n\nuse code PROMO for a discount today',
      'plain',
    );

    expect(messy.qualityScore).toBeLessThan(clean.qualityScore);
  });
});

describe('segmentTranscript - srt', () => {
  it('parses cue timing and text, preserving timestamps in milliseconds', () => {
    const srt = [
      '1',
      '00:00:00,000 --> 00:00:02,500',
      'Hello and welcome to the video.',
      '',
      '2',
      '00:00:02,500 --> 00:00:05,000',
      'Today we cover bounded agent workflows.',
      '',
    ].join('\n');

    const result = segmentTranscript(srt, 'srt');

    expect(result.segments).toHaveLength(2);
    expect(result.segments[0]?.startMs).toBe(0);
    expect(result.segments[0]?.endMs).toBe(2500);
    expect(result.segments[1]?.startMs).toBe(2500);
    expect(result.segments[1]?.text).toContain('bounded agent workflows');
  });
});

describe('segmentTranscript - vtt', () => {
  it('parses cue timing, strips the WEBVTT header and inline tags', () => {
    const vtt = [
      'WEBVTT',
      '',
      '00:00:00.000 --> 00:00:02.500',
      '<v Speaker>Hello and welcome.</v>',
      '',
      '00:00:02.500 --> 00:00:05.000',
      'Today we cover bounded agent workflows.',
      '',
    ].join('\n');

    const result = segmentTranscript(vtt, 'vtt');

    expect(result.segments).toHaveLength(2);
    expect(result.segments[0]?.startMs).toBe(0);
    expect(result.segments[0]?.text).not.toContain('<v');
    expect(result.segments[1]?.endMs).toBe(5000);
  });
});
