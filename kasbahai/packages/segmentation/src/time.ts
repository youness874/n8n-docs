/** Parses "HH:MM:SS,mmm" (SRT) or "HH:MM:SS.mmm" (VTT) into milliseconds. */
export function parseTimestampToMs(timestamp: string): number {
  const match = /(\d+):(\d{2}):(\d{2})[,.](\d{1,3})/.exec(timestamp.trim());
  if (!match) {
    throw new Error(`Unrecognized timestamp format: "${timestamp}"`);
  }
  const [, hours, minutes, seconds, millis] = match as unknown as [
    string,
    string,
    string,
    string,
    string,
  ];
  return (
    Number(hours) * 3_600_000 +
    Number(minutes) * 60_000 +
    Number(seconds) * 1_000 +
    Number(millis.padEnd(3, '0'))
  );
}
