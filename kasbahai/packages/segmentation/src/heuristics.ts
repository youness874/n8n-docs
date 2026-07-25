const SPEAKER_PREFIX = /^([A-Z][A-Za-z0-9 .'-]{0,30}):\s+(.*)$/s;

/** Extracts a "Speaker: text" prefix, if present, and returns the stripped text. */
export function extractSpeaker(text: string): { speaker?: string; text: string } {
  const match = SPEAKER_PREFIX.exec(text);
  if (!match) return { text };
  const [, speaker, rest] = match;
  return { speaker, text: rest!.trim() };
}

/** Collapses immediately repeated words ("the the" -> "the"), a common caption artifact. */
export function collapseRepeatedWords(text: string): string {
  return text.replace(/\b(\w+)(\s+\1\b)+/gi, '$1');
}

const PROMOTIONAL_PATTERNS = [
  /use code/i,
  /promo code/i,
  /discount/i,
  /% ?off/i,
  /link in the description/i,
  /sponsored by/i,
  /this video is sponsored/i,
  /check out (my|our) sponsor/i,
];

export function isPromotional(text: string): boolean {
  return PROMOTIONAL_PATTERNS.some((pattern) => pattern.test(text));
}

const EXAMPLE_PATTERNS = [/for example/i, /for instance/i, /let's say/i, /imagine (you|if)/i];

export function containsExample(text: string): boolean {
  return EXAMPLE_PATTERNS.some((pattern) => pattern.test(text));
}

const UNCLEAR_PATTERNS = [/\[inaudible\]/i, /\[unclear\]/i, /\?{3,}/];

export function isUnclear(text: string): boolean {
  return UNCLEAR_PATTERNS.some((pattern) => pattern.test(text));
}

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'to',
  'of',
  'in',
  'on',
  'is',
  'it',
  'that',
  'this',
  'for',
  'with',
  'you',
  'i',
  'we',
]);

function wordSet(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word)),
  );
}

/**
 * Jaccard similarity between two segments' significant words. Low overlap
 * between consecutive segments is treated as a topic-change signal.
 */
export function jaccardSimilarity(a: string, b: string): number {
  const setA = wordSet(a);
  const setB = wordSet(b);
  if (setA.size === 0 || setB.size === 0) return 1;

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

export const TOPIC_CHANGE_THRESHOLD = 0.08;
