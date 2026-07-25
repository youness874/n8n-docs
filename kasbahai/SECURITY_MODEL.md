# Security Model

## What's already enforced

**Workspace isolation.** Every table except `workspaces` carries a
`workspace_id` foreign key with `onDelete: 'cascade'`
(`packages/db/src/schema/columns.ts`). There is no cross-workspace query
path in the current codebase — every `db.query.*` call in `apps/web`
scopes by workspace or by a foreign key chain rooted in one.

**Transcript text is treated as untrusted input, end to end.**

- It is never interpolated into a prompt string. The AI gateway's
  `generateStructured()` takes `systemPrompt` (instructions) and `input`
  (source content) as separate fields, passed to the provider as separate
  message roles — see `AI_PROCESSING.md`. A regression test
  (`packages/ai-gateway/src/gateway.test.ts`) asserts that content in
  `input` (e.g. "ignore previous instructions...") never ends up inside
  `systemPrompt`.
- It is stored as opaque text (`Transcript.rawText`, `Transcript.cleanText`)
  and object-storage bytes, never executed, templated, or interpreted.

**All model responses are validated before they can be stored.** The
gateway parses the provider's response as JSON and validates it against
the caller-supplied Zod schema; anything that doesn't match throws before
it reaches a database insert. See `AI_PROCESSING.md`.

**Object storage path traversal is blocked.** `LocalObjectStorage`
(`packages/storage/src/drivers/local-object-storage.ts`) rejects absolute
keys and resolves every key against its root directory, throwing if the
resolved path would escape that root (checked with `path.relative`, not a
string-prefix check). Covered by
`packages/storage/src/local-object-storage.test.ts`.

**Uploaded file handling is narrow.** `detectFormatFromFilename`
(`apps/web/src/lib/transcript-input.ts`) only accepts `.txt`, `.docx`,
`.srt`, `.vtt` by extension and rejects anything else; `.docx` extraction
goes through `mammoth`'s text extractor rather than executing any macro
or embedded content.

**Structured output schemas reject the unexpected**, rather than coercing
it. A `schemaVersion` mismatch, a missing required field, or an
unrecognized enum value all fail validation instead of being silently
accepted (see `DATA_MODEL.md`'s versioning section).

## What's explicitly not built yet

This is a foundation milestone; the following are known gaps, not
oversights:

- **No authentication or authorization.** `apps/web` auto-creates and
  operates as a single default workspace. There is no login, no session,
  no per-user permission check anywhere in this codebase yet. Do not
  deploy this milestone somewhere it would be reachable by untrusted
  users.
- **No rate limiting or abuse controls** on project creation, transcript
  submission, or (once wired) AI generation calls.
- **No secrets management beyond environment variables.** `AI_GATEWAY_PROVIDER`
  and friends are read from `process.env` directly; a real provider's API
  key would need a secrets story before production use.
- **No output sanitization for rendering.** Segment text and future
  AI-generated content are rendered as plain text in React (which
  escapes by default), but no additional sanitization pass exists — this
  matters more once AI-generated HTML/rich content is introduced.
- **No audit log beyond `GenerationRun`.** Project/transcript
  creation and edits aren't separately audited.

## Guidance for new code in this repo

- Never string-concatenate transcript (or any user-supplied) content into
  a prompt. Use the gateway's `systemPrompt`/`input` split.
- Never add a raw SQL string built from user input; use Drizzle's query
  builder (parameterized by construction).
- Any new table needs a `workspace_id` column, following the existing
  `workspaceIdColumn()` pattern.
- Any new file-handling code should validate the extension/content type
  allowlist-style (like `detectFormatFromFilename`), not blocklist-style.
- Any new AI-module output schema should have every field the module is
  expected to return `required` (not `.optional()`) unless it's genuinely
  optional content — silent partial data is worse than a thrown
  validation error.
