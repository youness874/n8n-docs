'use server';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { schema } from '@kasbahai/db';
import { getDb } from '@/lib/db';
import { getJobQueue, SEGMENT_TRANSCRIPT_JOB } from '@/lib/jobs';
import { getObjectStorage } from '@/lib/storage';
import { detectFormatFromFilename, extractTextFromFile } from '@/lib/transcript-input';
import { optionalString, requireString } from './form-data';

export async function submitTranscriptAction(formData: FormData): Promise<void> {
  const db = getDb();

  const projectId = requireString(formData, 'projectId');
  const project = await db.query.projects.findFirst({
    where: (p, { eq: eqOp }) => eqOp(p.id, projectId),
  });
  if (!project) {
    throw new Error('Project not found');
  }

  const title = requireString(formData, 'title');
  const channelOrCreator = optionalString(formData, 'channelOrCreator');
  const youtubeUrl = optionalString(formData, 'youtubeUrl');
  const pastedText = optionalString(formData, 'pastedText');
  const file = formData.get('file');

  const { inputFormat, rawText, sourceType } = await readTranscriptInput(file, pastedText);

  const [sourceVideo] = await db
    .insert(schema.sourceVideos)
    .values({
      workspaceId: project.workspaceId,
      projectId: project.id,
      sourceType: youtubeUrl ? 'youtube_url' : sourceType,
      youtubeUrl,
      title,
      channelOrCreator,
    })
    .returning();
  if (!sourceVideo) {
    throw new Error('Failed to create source video');
  }

  const [transcript] = await db
    .insert(schema.transcripts)
    .values({
      workspaceId: project.workspaceId,
      projectId: project.id,
      sourceVideoId: sourceVideo.id,
      inputFormat,
      rawText,
      status: 'raw',
    })
    .returning();
  if (!transcript) {
    throw new Error('Failed to create transcript');
  }

  const { key } = await getObjectStorage().put({
    key: `transcripts/${transcript.id}.txt`,
    body: rawText,
    contentType: 'text/plain',
  });
  await db
    .update(schema.transcripts)
    .set({ storageObjectKey: key })
    .where(eq(schema.transcripts.id, transcript.id));

  await getJobQueue().enqueue(SEGMENT_TRANSCRIPT_JOB, { transcriptId: transcript.id });

  redirect(`/projects/${project.id}`);
}

async function readTranscriptInput(
  file: FormDataEntryValue | null,
  pastedText: string | undefined,
): Promise<{
  inputFormat: 'pasted' | 'txt' | 'docx' | 'srt' | 'vtt';
  rawText: string;
  sourceType: 'uploaded_file' | 'pasted_transcript';
}> {
  if (file instanceof File && file.size > 0) {
    const inputFormat = detectFormatFromFilename(file.name);
    const rawText = await extractTextFromFile(file, inputFormat);
    return { inputFormat, rawText, sourceType: 'uploaded_file' };
  }
  if (pastedText) {
    return { inputFormat: 'pasted', rawText: pastedText, sourceType: 'pasted_transcript' };
  }
  throw new Error('Provide a pasted transcript or upload a .txt/.docx/.srt/.vtt file.');
}
