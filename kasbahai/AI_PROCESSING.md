# AI Processing

## The gateway is the only door

`packages/ai-gateway`'s `AiGateway.generateStructured()` is the single
place any code in this repository is allowed to call a model. No module
imports a model SDK directly.

```ts
gateway.generateStructured({
  promptVersion: 'intelligence-analyst-v1',
  schemaVersion: 'intelligence-map-draft-v1',
  systemPrompt: SYSTEM_PROMPT, // instructions — trusted
  input: cleanTranscriptText, // untrusted source content
  schema: IntelligenceMapDraftSchema,
  modelId, // optional override; else the gateway's default
});
```

What it guarantees:

- **The response is parsed as JSON and validated against the caller's Zod
  schema before it is returned.** Invalid JSON throws
  `AiGatewayInvalidJsonError`; JSON that doesn't match the schema throws
  `AiGatewaySchemaValidationError` (with the Zod issues attached). Nothing
  downstream ever sees an unvalidated model response.
- **`systemPrompt` and `input` are separate fields on the request, always.**
  A provider implementation receives them as distinct message roles; it
  must never concatenate `input` into `systemPrompt`. This is what keeps
  transcript text — which is untrusted, user-supplied content — from being
  able to smuggle instructions to the model. `packages/ai-gateway/src/gateway.test.ts`
  has a regression test for this specifically.
- **Every call records what produced it**: the returned
  `GeneratedResult` carries `promptVersion`, `schemaVersion`, and
  `modelId` alongside the data. The `GenerationRun` entity
  (`packages/schemas/src/generation-run.ts`) is the persisted form of this
  — one row per call, so any stored result can be traced back to exactly
  which prompt/schema/model version produced it.
- **Model selection is configuration.** `createAiGatewayFromEnv()`
  (`packages/ai-gateway/src/registry.ts`) reads `AI_GATEWAY_PROVIDER` and
  `AI_GATEWAY_DEFAULT_MODEL`. Today only `mock` is registered; adding a
  real provider means implementing `AiProvider` and adding one `case` —
  nothing above the gateway changes.

## The mock provider

`MockProvider` (`packages/ai-gateway/src/providers/mock-provider.ts`) is a
network-free `AiProvider` used in development and in every module's unit
tests. It takes a `responder(request) => string` function, so tests can
assert exactly what the module sent (`systemPrompt`, `input`) and control
exactly what comes back — including deliberately invalid responses, to
exercise the validation-error paths.

## The five modules, and what "done" means for each right now

| Module                          | Package                                 | Status this milestone                                                                                                                                                                                                                                                             |
| ------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Source Processor             | `@kasbahai/module-source-processor`     | **Fully implemented**, deterministic — no AI call. Wraps `@kasbahai/segmentation`'s parsing (SRT/VTT/plain-text) and heuristics (speaker extraction, repeated-word collapse, promotional/example/unclear flagging, topic-change detection via word-overlap, a 0–1 quality score). |
| 2. Intelligence Analyst         | `@kasbahai/module-intelligence-analyst` | AI-gateway wiring + draft schema + a first-pass system prompt. Not yet tuned with few-shot examples or evidence-reference resolution.                                                                                                                                             |
| 3. Video Strategist             | `@kasbahai/module-video-strategist`     | Same: wiring + schema + prompt for proposing multiple `VideoConceptDraft`s.                                                                                                                                                                                                       |
| 4. Script and Production Engine | `@kasbahai/module-script-engine`        | Same: wiring + schema + prompt producing a full `MasterVideoVersionDraft` (strategy, structure, script, publishing package).                                                                                                                                                      |
| 5. Repurposing Engine           | `@kasbahai/module-repurposing-engine`   | Same: wiring + schema + prompt producing shorts/carousels/social posts as a `RepurposingBundleDraft` from an approved Master Video's content.                                                                                                                                     |

"Wiring" means: each module's `Default*` class takes an `AiGateway` in its
constructor, calls `generateStructured` with a real prompt and a real Zod
schema, and has a passing unit test proving the round trip (mock response
→ validated, typed data). What's deliberately **not** done yet: connecting
modules 2–5 into `apps/web`'s UI/server actions, prompt quality tuning,
retries, evidence-reference resolution, and the quality-review gates
(`QualityReview` — originality/accuracy/content/brand) that must pass
before a `MasterVideoVersion` can be approved. See `ROADMAP.md`.

## Structured output, not free text

Every module schema (`IntelligenceMapDraftSchema`,
`VideoConceptDraftListSchema`, `MasterVideoVersionDraftSchema`,
`RepurposingBundleDraftSchema`) is a Zod object with explicit required
fields and `.default([])` on optional lists. This is intentional: a
partial or malformed generation fails validation loudly (as a thrown
error) rather than being stored as a half-populated row. There is no
"best effort" persistence path in this milestone — a failed generation
run is a failed generation run.
