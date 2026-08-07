# Roadmap

## Milestone 1 — Working foundation (this change)

- [x] Monorepo structure (`pnpm` workspaces: `apps/web`, `packages/*`,
      `packages/modules/*`).
- [x] Application shell (Next.js 14 App Router, server components +
      server actions).
- [x] Database + initial migration (PostgreSQL via Drizzle; 17 tables,
      generated migration in `packages/db/migrations/`).
- [x] Versioned shared schemas for every core entity (`packages/schemas`).
- [x] Project creation.
- [x] Transcript input (paste, or upload `.txt`/`.docx`/`.srt`/`.vtt`)
      and storage (object storage + a `Transcript` row).
- [x] Transcript segmentation (deterministic — `packages/segmentation`,
      wired as a background job).
- [x] AI gateway interface (`packages/ai-gateway`), with a mock provider
      and a real registry seam for a production provider.
- [x] Background-job abstraction (`packages/jobs`), in-memory driver.
- [x] Structured-result validation (every AI-gateway call validates the
      response against a Zod schema before returning it).
- [x] Placeholder interfaces for the five processing modules, with
      Module 1 fully implemented and Modules 2–5 wired to the AI gateway
      (schema + prompt + passing tests against a mock provider).
- [x] Unit tests (all packages) and one real integration test
      (`packages/db`, against a live Postgres, run in CI via a service
      container).
- [x] Formatting (Prettier), linting (ESLint flat config +
      typescript-eslint), type checking (`tsc --noEmit` per package), and
      CI (`.github/workflows/kasbahai-ci.yml`, scoped to `kasbahai/**`).
- [x] `PRODUCT_CONSTITUTION.md`, `SYSTEM_ARCHITECTURE.md`,
      `DATA_MODEL.md`, `AI_PROCESSING.md`, `SECURITY_MODEL.md`,
      `DESIGN_SYSTEM.md`, `ROADMAP.md`, `AGENTS.md`.

Deliberately **not** done in this milestone: the complete generation
workflow (Understand/Reinvent/Create Video/Repurpose UI), quality-review
gates, prompt tuning, and anything under Milestones 2–5 below.

## Milestone 2 — Intelligence Map

- Wire Module 2 (`@kasbahai/module-intelligence-analyst`) into `apps/web`:
  a job triggered once a transcript is `ready`, persisting a
  `SourceIntelligenceMap` row and resolving `EvidenceReference`s against
  real `TranscriptSegment` ids (the draft schema currently returns
  `supportingQuote` text, not resolved ids).
- Core-thesis / audience / framework / story / evidence extraction
  prompt tuning, with a small hand-labeled test-transcript set to check
  against.
- The "Understand" review screen: render the intelligence map with links
  back to the transcript segments each claim came from.

## Milestone 3 — Master Video

- Wire Module 3 (`@kasbahai/module-video-strategist`) and Module 4
  (`@kasbahai/module-script-engine`) into `apps/web`.
- Angle generation + selection UI ("Reinvent").
- Outline → script → scene/B-roll plan generation and an editing UI that
  creates a new `MasterVideoVersion` per edit (not a mutation of an
  existing version).
- Title/thumbnail/description generation as part of the publishing
  package.
- Version history view.

## Milestone 4 — Content Pack

- Wire Module 5 (`@kasbahai/module-repurposing-engine`) into `apps/web`,
  gated on `MasterVideo.status === 'approved'`.
- Shorts, carousel, and per-platform (LinkedIn/Instagram/X) social post
  generation and review screens.
- Export (at minimum: copyable text / downloadable JSON per asset —
  no publishing integrations yet, per the product constitution).

## Milestone 5 — Reliability

- The four quality gates as real, callable checks:
  originality (structural/wording similarity to source), grounding
  (every claim resolves to an `EvidenceReference` or is flagged),
  accuracy, brand alignment against a `BrandProfile`.
- Retry policy for AI-gateway calls (currently: one attempt, throw on
  failure).
- Cost tracking per `GenerationRun`.
- Prompt and schema version registry / changelog (today, versions are
  just string constants per module — fine at this scale, worth
  formalizing once there are many).
- A real, checked-in test transcript dataset (golden inputs/outputs) for
  regression testing prompt changes.

## Not planned yet (explicitly out of scope until reconsidered)

- Non-YouTube source types (podcasts, books, meetings).
- Automated YouTube transcript retrieval.
- Publishing integrations to any platform.
- Analytics / performance feedback loop.
- Multi-workspace / auth UI (the schema already supports it; the product
  doesn't expose it yet — see `SECURITY_MODEL.md`).
