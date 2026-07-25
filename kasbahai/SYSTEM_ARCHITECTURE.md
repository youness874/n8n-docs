# System Architecture

## Style: modular monolith

One deployable web application (`apps/web`), backed by a set of focused
TypeScript packages, each owning one concern. No microservices, no
message bus, no per-module deployment. Modules are separated by package
boundaries and TypeScript interfaces, not by network calls.

```
kasbahai/
├── apps/
│   └── web/                        Next.js 14 app (UI + server actions)
├── packages/
│   ├── schemas/                    Versioned Zod schemas for every entity
│   ├── db/                         Drizzle ORM schema, migrations, client
│   ├── ai-gateway/                 The single choke point for model calls
│   ├── jobs/                       Background-job abstraction
│   ├── storage/                    Object-storage abstraction
│   ├── segmentation/               Deterministic transcript parsing/heuristics
│   └── modules/
│       ├── source-processor/       Module 1
│       ├── intelligence-analyst/   Module 2
│       ├── video-strategist/       Module 3
│       ├── script-engine/          Module 4
│       └── repurposing-engine/     Module 5
```

```
Orchestrator (apps/web: server actions + job handlers)
   ├── Source Processor        (@kasbahai/module-source-processor)
   ├── Intelligence Analyst    (@kasbahai/module-intelligence-analyst)
   ├── Video Strategist        (@kasbahai/module-video-strategist)
   ├── Script Engine           (@kasbahai/module-script-engine)
   └── Repurposing Engine      (@kasbahai/module-repurposing-engine)
```

There is no orchestrator class yet beyond `apps/web`'s server actions and
job handlers — the five modules are called directly. An explicit
orchestrator package is worth introducing once a second caller (e.g. a
CLI or a queue worker) needs the same sequencing; see `ROADMAP.md`.

## Why these choices

- **TypeScript everywhere**, one language across UI, server, and data
  layer, so the same Zod schemas type-check requests, AI responses, and
  database rows.
- **pnpm workspaces**, no build step required to run tests/typecheck
  across packages during development; `apps/web` still gets a real
  production `next build`.
- **Next.js App Router** for `apps/web`: server components read the
  database directly, server actions handle form submissions (project
  creation, transcript submission) without a separate REST/RPC layer.
  This is the whole "web interface" required by milestone 1 — no
  additional API framework was introduced.
- **PostgreSQL via Drizzle ORM**: relational data with real foreign keys
  matches the pipeline's strict entity graph (see `DATA_MODEL.md`).
  Drizzle was chosen over Prisma for schema-as-TypeScript-code (no
  separate DSL/codegen step) and first-class migration files reviewed as
  plain SQL.
- **Object storage abstraction, not files-in-Postgres**: transcripts and
  future generated assets live behind `ObjectStorage` (`packages/storage`),
  with a local-disk driver for development and a documented seam for an
  S3-compatible driver in production.
- **One AI gateway** (`packages/ai-gateway`): every model call in the
  system goes through `AiGateway.generateStructured()`. No module talks to
  a model SDK directly. See `AI_PROCESSING.md`.
- **A background-job abstraction** (`packages/jobs`): transcript
  segmentation and (later) every AI-generation step run as a named job
  through `JobQueue`, not inline in a request handler. The in-memory
  driver is used in development/tests; the interface is designed so a
  durable driver (pg-boss, BullMQ, ...) can replace it without touching
  callers.

## Request flow (what's wired today)

1. `POST` (server action) `createProjectAction` → inserts a `Project` row
   scoped to the (single, auto-created) default `Workspace`.
2. `POST` (server action) `submitTranscriptAction` → determines the
   transcript's format, extracts text (mammoth for `.docx`), inserts
   `SourceVideo` + `Transcript` rows, stores the raw text via
   `ObjectStorage`, and enqueues a `segment-transcript` job.
3. The `segment-transcript` job handler (`apps/web/src/lib/jobs.ts`) runs
   `DefaultSourceProcessor` (`@kasbahai/module-source-processor`), which
   wraps `@kasbahai/segmentation`'s deterministic parsing, then persists
   `TranscriptSegment` rows and updates the `Transcript`'s `cleanText`,
   `qualityScore`, and `status`.
4. The project detail page re-reads the `Transcript` and its segments and
   renders them.

Modules 2–5 are implemented as classes wired to the AI gateway
(`DefaultIntelligenceAnalyst`, `DefaultVideoStrategist`,
`DefaultScriptEngine`, `DefaultRepurposingEngine`) with passing unit tests
against a mock provider, but are **not yet called from `apps/web`** — that
wiring (the Understand/Reinvent/Create Video/Repurpose steps of the UI) is
milestone 2–4 work.

## Configuration surface

Every external dependency is selected through configuration, never
hardcoded:

| Concern         | Env var                    | Values (this milestone)        |
| --------------- | -------------------------- | ------------------------------ |
| Database        | `DATABASE_URL`             | any Postgres connection string |
| Object storage  | `STORAGE_DRIVER`           | `local`                        |
| Background jobs | `JOBS_DRIVER`              | `memory`                       |
| AI provider     | `AI_GATEWAY_PROVIDER`      | `mock`                         |
| Default model   | `AI_GATEWAY_DEFAULT_MODEL` | any string, provider-defined   |

See `kasbahai/.env.example`. Adding a new driver/provider means adding one
case to that package's `registry.ts` — callers never change.
