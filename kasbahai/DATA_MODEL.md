# Data Model

Schemas live twice, deliberately:

- `packages/schemas` — versioned Zod schemas describing the shape of a
  _persisted_ entity (what a repository layer reads/writes). These are
  the contract other packages and the UI import.
- `packages/db/src/schema` — Drizzle table definitions, the actual
  Postgres columns. Column names are the `snake_case` counterparts of the
  Zod schema's `camelCase` fields.

Each AI-generating module additionally defines its own **draft schema**
(e.g. `IntelligenceMapDraftSchema` in
`packages/modules/intelligence-analyst`) describing exactly what the model
must return: the content fields only, with no `id`, `workspaceId`,
timestamps, or resolved foreign keys. A draft becomes a persisted entity
once a caller assigns those. This keeps "what the model is asked to
produce" decoupled from "what the database stores."

## Versioning

Every persisted-entity schema has a literal `schemaVersion` field (e.g.
`schemaVersion: 1`). `packages/schemas/src/common.ts`'s `schemaVersion()`
helper produces `z.literal(n)` — parsing a record whose stored version
doesn't match the current schema's expected literal fails validation
instead of being silently coerced. When a shape changes in an
incompatible way, bump the literal and add a migration path; don't mutate
the existing version in place.

Every AI generation is separately versioned via `GenerationRun`
(`promptVersion`, `outputSchemaVersion`, `modelId`) — see
`AI_PROCESSING.md`.

## Workspace isolation

Every table except `workspaces` itself has a `workspace_id` foreign key
(`packages/db/src/schema/columns.ts`'s `workspaceIdColumn()`), enforced at
the database level with `onDelete: 'cascade'`. There is no
multi-workspace UI yet — `apps/web` auto-creates and uses one `default`
workspace (`getOrCreateDefaultWorkspace`) — but every query and insert
already goes through the workspace-scoped column, so adding real
multi-tenancy later is additive, not a schema rewrite.

## Entities and their relationships

```
Workspace
  └── Project
       ├── BrandProfile (optional, referenced)
       └── SourceVideo
            └── Transcript
                 ├── TranscriptSegment[]        (ordered, timestamped)
                 └── SourceIntelligenceMap
                      ├── EvidenceReference[]    (→ TranscriptSegment)
                      └── VideoConcept[]         ("Reinvent" candidates)
                           └── MasterVideo
                                └── MasterVideoVersion[]  (immutable, versioned)
                                     ├── QualityReview[]  (originality/accuracy/content/brand)
                                     ├── ShortVideo[]
                                     ├── Carousel[]
                                     │    └── CarouselSlide[]
                                     └── SocialPost[]

GenerationRun — one row per AI-gateway call, linked to a Project and a
                module name; not shown above since it cross-cuts every step.
```

Key constraints this encodes:

- A `MasterVideo` has exactly one selected `VideoConcept`
  (`videoConceptId`, `onDelete: 'restrict'` — you cannot delete a concept
  a video was built from).
- `MasterVideoVersion` is **immutable and append-only**: editing a script
  creates version _N+1_; `MasterVideo.currentVersionId` and
  `approvedVersionId` point at specific versions. This preserves the
  approval history quality gates are checked against.
- `ShortVideo`, `Carousel`, and `SocialPost` all foreign-key to a
  `MasterVideoVersion` (and its parent `MasterVideo`), never to a
  `Transcript` or `SourceIntelligenceMap` directly — this is what makes
  "generate only from the approved Master Video" a database constraint,
  not just a convention.
- `EvidenceReference` links a claim back to the `TranscriptSegment` it
  came from, so the accuracy quality gate can check grounding rather than
  trusting the model.

## Migrations

`packages/db` uses `drizzle-kit generate` to produce plain SQL migration
files under `packages/db/migrations/`, and `drizzle-orm`'s `migrate()`
(via `pnpm db:migrate`, wrapping `src/migrate.ts`) to apply them. Nothing
here uses `drizzle-kit push` — every schema change should go through a
generated, reviewed migration file, checked into version control.

Two foreign-key constraint names (`short_videos_master_video_version_id_...`
and `social_posts_master_video_version_id_...`) exceed Postgres's 63-byte
identifier limit and are silently truncated by Postgres at creation time;
this produces a harmless `NOTICE`, not an error, and both truncate to
distinct names, so there's no collision. Worth naming these constraints
explicitly if it starts being noisy.
