# AGENTS.md

Guidance for any coding agent (or human) working in `kasbahai/`. This file
is about how to work in this codebase — it is not about the product's AI
processing modules; those are documented in `AI_PROCESSING.md`. There is
no 60-assistant roster here and none should be reintroduced — see
`PRODUCT_CONSTITUTION.md`.

## Setup

```bash
cd kasbahai
pnpm install
cp .env.example .env.local   # then set DATABASE_URL, etc.
docker compose up -d postgres  # or point DATABASE_URL at any Postgres 16
pnpm db:migrate
```

## Everyday commands (run from `kasbahai/`)

```bash
pnpm lint              # eslint .
pnpm format             # prettier --check .
pnpm format:write       # prettier --write .
pnpm typecheck          # tsc --noEmit, per package
pnpm test               # vitest run, per package (no DB required)
pnpm test:integration   # requires a real DATABASE_URL (see packages/db)
pnpm build              # next build for apps/web
```

CI (`.github/workflows/kasbahai-ci.yml`) runs all of the above against a
Postgres service container on every PR touching `kasbahai/**`. Run the
same commands locally before pushing.

## Repository conventions

- **One module, one package.** `packages/modules/*` each expose an
  interface + a `Default*` implementation class, constructed with an
  `AiGateway`. Don't reach into another module's internals — depend on
  its exported interface/types only.
- **Relative imports have no file extension** (`from './foo'`, not
  `from './foo.js'`). This project uses `moduleResolution: "Bundler"`;
  extensioned relative imports break `drizzle-kit` and Next.js's webpack
  resolver even though Vitest tolerates them — keep them off everywhere in
  `kasbahai/`, not just where you're touching.
- **Every AI-generating module needs three things**: a Zod _draft_
  schema (what the model must return — see `DATA_MODEL.md`), a
  `SYSTEM_PROMPT` string constant, and a `PROMPT_VERSION`/
  `OUTPUT_SCHEMA_VERSION` pair passed to `AiGateway.generateStructured()`.
  Bump the version string when you change the prompt or the schema shape
  in a way that would invalidate a previously-stored `GenerationRun`.
- **Never concatenate untrusted content into a system prompt.** Pass it
  as `input`, not folded into `systemPrompt`. See `SECURITY_MODEL.md` and
  `packages/ai-gateway/src/gateway.test.ts` for the regression test this
  must keep passing.
- **New tables need a `workspace_id`.** Use the existing
  `workspaceIdColumn()` helper (`packages/db/src/schema/columns.ts`).
- **Schema changes go through `drizzle-kit generate`**, never
  `drizzle-kit push`. Check the generated SQL into
  `packages/db/migrations/` and skim it before committing — Drizzle's
  auto-generated FK constraint names can exceed Postgres's 63-byte limit
  on longer table/column name combinations (see `DATA_MODEL.md`); this is
  currently harmless (Postgres truncates deterministically) but is worth
  double-checking for accidental collisions on any new long names.
- **Every package that has runtime logic has a `vitest.config.ts` and at
  least one `*.test.ts`.** Prefer testing against the real thing over
  mocking: `packages/db`'s integration test runs real SQL against a real
  Postgres; `packages/storage`'s tests use a real temp directory; only
  the AI gateway itself is mocked (via `MockProvider`), since it's the
  one dependency that's actually external.
- **Don't build ahead of the milestone you're on.** If you're working
  Milestone 2+ items (see `ROADMAP.md`), it's fine — expected, even — to
  delete a "placeholder" comment once real logic replaces it. Don't add
  speculative abstraction (a second AI provider, a second storage driver,
  a second job driver) before something in the codebase actually needs
  it; the registry pattern in each package makes adding one later a
  small, contained change.

## Where things are, when you're not sure

- Entity shape and versioning rules → `DATA_MODEL.md`.
- How a model call is made, validated, and audited → `AI_PROCESSING.md`.
- What's intentionally not secured/built yet → `SECURITY_MODEL.md`.
- Module boundaries and the request flow that's actually wired today →
  `SYSTEM_ARCHITECTURE.md`.
- What's next and in what order → `ROADMAP.md`.
