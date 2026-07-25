export type SupportedTranscriptFormat = 'pasted' | 'txt' | 'docx' | 'srt' | 'vtt';

const EXTENSION_TO_FORMAT: Record<string, SupportedTranscriptFormat> = {
  txt: 'txt',
  docx: 'docx',
  srt: 'srt',
  vtt: 'vtt',
};

export function detectFormatFromFilename(filename: string): SupportedTranscriptFormat {
  const extension = filename.split('.').pop()?.toLowerCase();
  const format = extension ? EXTENSION_TO_FORMAT[extension] : undefined;
  if (!format) {
    throw new Error(
      `Unsupported transcript file type ".${extension ?? ''}". Supported: .txt, .docx, .srt, .vtt`,
    );
  }
  return format;
}

export async function extractTextFromFile(
  file: File,
  format: SupportedTranscriptFormat,
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (format === 'docx') {
    const mammoth = await import('mammoth');
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
  return buffer.toString('utf8');
}
