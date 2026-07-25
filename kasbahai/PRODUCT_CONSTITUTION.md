# KasbahAI — Product Constitution

## What this is

KasbahAI YouTube Regeneration Studio turns a YouTube transcript into an
original, improved long-form video, then repurposes that approved video
into shorts, carousels, and platform-native social posts.

This is a new, focused product. It is not a continuation of the previous
60-assistant architecture, and none of that system's prompts or agent
roster are migrated here. Everything in this repository is scoped to one
pipeline, built to work reliably end to end before it is broadened.

## The canonical pipeline

```
YouTube URL or transcript
        ↓
Transcript preparation           (Module 1 — Source Processor)
        ↓
Source intelligence extraction   (Module 2 — Intelligence Analyst)
        ↓
Original angle development       (Module 3 — Video Strategist)
        ↓
New long-form video creation      (Module 4 — Script and Production Engine)
        ↓
Quality and originality review
        ↓
Approved master content package
        ↓
Short videos + posts + carousels  (Module 5 — Repurposing Engine)
```

The **approved Master Video is the single source of truth**. Shorts,
carousels, and social posts are generated only from the approved Master
Video's content — never independently from the raw transcript. This is
enforced in the data model: `ShortVideo`, `Carousel`, and `SocialPost`
foreign-key to a `MasterVideoVersion`, not to a `Transcript`.

```
Correct:                              Wrong (not built):
Source transcript                     Original transcript
     ↓                                     ├── YouTube script
Source Intelligence Map                    ├── Shorts
     ↓                                     ├── Posts
Video Concepts                             └── Carousels
     ↓                                (disconnected, inconsistent assets)
Approved Master Video
     ├── Shorts
     ├── Carousels
     └── Social Posts
```

## Core product principle: extract systems, not words

The Intelligence Analyst's job is not summarization. It identifies the
reusable intelligence inside a transcript — thesis, audience problem,
frameworks, processes, arguments, examples, stories, analogies,
objections, psychological triggers, teaching sequence, evidence, and
content gaps — so the Video Strategist and Script Engine can build
something original from it rather than paraphrasing it.

The resulting video must:

- Use the extracted intelligence, not the source transcript's wording.
- Introduce a genuinely different angle and structure.
- Avoid reproducing the original creator's distinctive phrasing or
  personal style.

This is checked, not assumed: every `MasterVideoVersion` goes through
originality, accuracy, content, and brand quality reviews before it can be
marked approved (see `AI_PROCESSING.md`).

## Scope of this milestone

Built now:

- YouTube URL / pasted / uploaded (.txt, .docx, .srt, .vtt) transcript
  input.
- Deterministic transcript cleaning and segmentation (Module 1, fully
  implemented — no AI call required).
- AI-gateway-wired placeholders for Modules 2–5 (schema + prompt +
  validation wiring in place; prompt quality and few-shot tuning are
  future milestones).
- The full data model, versioned and workspace-isolated.
- A five-step web workspace shell: Import → Understand → Reinvent →
  Create Video → Repurpose (only Import is fully wired end to end).

Explicitly out of scope for this milestone:

- Automated YouTube transcript retrieval (paste/upload only for now).
- Podcasts, books, meetings, or any non-YouTube source type.
- Publishing integrations to any platform.
- Analytics or a learning loop.
- Every possible platform format — only LinkedIn, Instagram, and X are
  modeled for posts; Instagram, LinkedIn, and Pinterest for carousels.

See `ROADMAP.md` for how the remaining milestones build on this
foundation.
