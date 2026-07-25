# KasbahAI YouTube Regeneration Studio

Turns a YouTube transcript into an original, improved long-form video, then
repurposes that approved video into shorts, carousels, and platform-native
social posts.

This is a self-contained product living inside the `n8n-docs` repository
under `kasbahai/` — it has nothing to do with n8n itself. See
[`PRODUCT_CONSTITUTION.md`](./PRODUCT_CONSTITUTION.md) for what it is and
why it's structured this way.

## Quick start

Prerequisites: **Node.js 20+**, **pnpm**, and **Docker** (or any reachable
Postgres 16 instance).

```bash
cd kasbahai
pnpm install
cp .env.example .env.local     # edit if you're not using the default docker-compose Postgres
docker compose up -d postgres  # skip this if DATABASE_URL already points at a real Postgres
pnpm db:migrate
pnpm --filter @kasbahai/web dev
```

Open **http://localhost:3000**.

If you're driving this from an agentic IDE (Antigravity, Cursor, etc.)
instead of typing the commands yourself, you can just ask its agent to run
the steps above and open a browser preview — nothing about the app changes,
it's a normal Next.js + Postgres project underneath.

## What you can actually do right now

Only the **Import** step is wired into the UI end to end this milestone:

1. Home page → **"+ New project"**.
2. Fill in project name, target audience, language, tone, objective.
3. On the project page, submit a transcript — paste text, or upload a
   `.txt` / `.docx` / `.srt` / `.vtt` file.
4. Reload the page: you'll see the transcript segmented, with per-segment
   flags (`topic change`, `example`, `promotional`, `unclear`) and a
   quality score.

The **Understand / Reinvent / Create Video / Repurpose** steps show in the
nav but aren't wired to the UI yet — the modules behind them
(`packages/modules/*`) exist and are unit-tested against a mock AI
provider, they're just not called from `apps/web` yet. See
[`ROADMAP.md`](./ROADMAP.md) for what's next.

## Everyday commands

```bash
pnpm lint               # eslint .
pnpm format              # prettier --check .
pnpm format:write        # prettier --write .
pnpm typecheck           # tsc --noEmit, per package
pnpm test                # vitest run, per package (no DB required)
pnpm test:integration    # requires a real DATABASE_URL
pnpm build               # next build for apps/web
```

## Repository map

```
kasbahai/
├── apps/web/                 Next.js app (UI + server actions)
└── packages/
    ├── schemas/               Versioned Zod schemas for every entity
    ├── db/                    Drizzle ORM schema + migrations
    ├── ai-gateway/            The single choke point for model calls
    ├── jobs/                  Background-job abstraction
    ├── storage/               Object-storage abstraction
    ├── segmentation/          Deterministic transcript parsing/heuristics
    └── modules/
        ├── source-processor/      Module 1 — fully implemented
        ├── intelligence-analyst/  Module 2 — AI-gateway wired, not in UI yet
        ├── video-strategist/      Module 3 — AI-gateway wired, not in UI yet
        ├── script-engine/         Module 4 — AI-gateway wired, not in UI yet
        └── repurposing-engine/    Module 5 — AI-gateway wired, not in UI yet
```

## More detail

- [`PRODUCT_CONSTITUTION.md`](./PRODUCT_CONSTITUTION.md) — what this is and isn't
- [`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md) — how it's put together
- [`DATA_MODEL.md`](./DATA_MODEL.md) — the entity graph and versioning rules
- [`AI_PROCESSING.md`](./AI_PROCESSING.md) — how model calls are made and validated
- [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) — what's enforced, what's a known gap
- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — the five-step UI and current visual approach
- [`ROADMAP.md`](./ROADMAP.md) — what's built vs. what's next
- [`AGENTS.md`](./AGENTS.md) — conventions for anyone (human or agent) working in this codebase
