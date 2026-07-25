import { notFound } from 'next/navigation';
import { submitTranscriptAction } from '@/app/actions/transcripts';
import { getDb } from '@/lib/db';

// Reads live transcript/segment state per request; not prerenderable.
export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const db = getDb();
  const project = await db.query.projects.findFirst({
    where: (p, { eq }) => eq(p.id, params.projectId),
  });
  if (!project) {
    notFound();
  }

  const transcripts = await db.query.transcripts.findMany({
    where: (t, { eq }) => eq(t.projectId, project.id),
    orderBy: (t, { desc }) => desc(t.createdAt),
  });
  const latestTranscript = transcripts[0];

  const segments = latestTranscript
    ? await db.query.transcriptSegments.findMany({
        where: (s, { eq }) => eq(s.transcriptId, latestTranscript.id),
        orderBy: (s, { asc }) => asc(s.index),
      })
    : [];

  return (
    <section>
      <h1>{project.name}</h1>
      <nav className="stage-nav">
        <span>1. Import</span>
        <span>2. Understand</span>
        <span>3. Reinvent</span>
        <span>4. Create Video</span>
        <span>5. Repurpose</span>
      </nav>

      <p>
        Audience: {project.targetAudience} · Tone: {project.tone} · Language: {project.language}
      </p>

      {latestTranscript && (
        <TranscriptStatus
          status={latestTranscript.status}
          qualityScore={latestTranscript.qualityScore}
          segmentCount={segments.length}
          segments={segments}
        />
      )}
      {(!latestTranscript || latestTranscript.status === 'failed') && (
        <TranscriptForm projectId={project.id} />
      )}
    </section>
  );
}

function TranscriptForm({ projectId }: { projectId: string }) {
  return (
    <form action={submitTranscriptAction} encType="multipart/form-data">
      <input type="hidden" name="projectId" value={projectId} />

      <label htmlFor="title">Video title</label>
      <input id="title" name="title" required />

      <label htmlFor="channelOrCreator">Channel / creator (optional)</label>
      <input id="channelOrCreator" name="channelOrCreator" />

      <label htmlFor="youtubeUrl">YouTube URL (optional)</label>
      <input
        id="youtubeUrl"
        name="youtubeUrl"
        type="url"
        placeholder="https://youtube.com/watch?v=..."
      />

      <label htmlFor="pastedText">Paste transcript</label>
      <textarea
        id="pastedText"
        name="pastedText"
        rows={10}
        placeholder="Paste transcript text here"
      />

      <label htmlFor="file">…or upload a .txt, .docx, .srt or .vtt file</label>
      <input id="file" name="file" type="file" accept=".txt,.docx,.srt,.vtt" />

      <button type="submit">Submit transcript</button>
    </form>
  );
}

interface SegmentRow {
  index: number;
  text: string;
  speaker: string | null;
  isTopicChange: boolean;
  isExample: boolean;
  isPromotional: boolean;
  isUnclear: boolean;
}

function TranscriptStatus({
  status,
  qualityScore,
  segmentCount,
  segments,
}: {
  status: string;
  qualityScore: number | null;
  segmentCount: number;
  segments: SegmentRow[];
}) {
  return (
    <div>
      <h2>Transcript</h2>
      <p>
        Status: <strong>{status}</strong>
        {qualityScore != null && <> · Quality score: {qualityScore.toFixed(2)}</>}
        {status === 'ready' && <> · {segmentCount} segments</>}
      </p>
      {status === 'processing' && <p>Segmenting transcript…</p>}
      {status === 'failed' && <p>Segmentation failed. Submit a transcript to try again.</p>}
      {segments.map((segment) => (
        <div key={segment.index} className="segment">
          <div>
            {segment.speaker && <strong>{segment.speaker}: </strong>}
            {segment.text}
          </div>
          <div className="segment-flags">
            {segment.isTopicChange && '• topic change '}
            {segment.isExample && '• example '}
            {segment.isPromotional && '• promotional '}
            {segment.isUnclear && '• unclear '}
          </div>
        </div>
      ))}
    </div>
  );
}
