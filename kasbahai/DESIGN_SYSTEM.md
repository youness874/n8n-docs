# Design System

## The five-step workspace

The product's UI is organized as one linear workspace per project:

```
1. Import      Add the URL/transcript, target audience, language, tone,
               objective, approximate length, optional brand profile and
               instructions.
2. Understand  Review the extracted ideas, frameworks, stories, evidence,
               and content gaps (the Source Intelligence Map).
3. Reinvent    Compare original video angles and select the strongest
               direction (the Video Concepts).
4. Create Video Edit and approve the master script and production plan
               (the Master Video / Master Video Version).
5. Repurpose   Generate short videos, carousels, and platform posts from
               the approved Master Video.
```

A project's detail page (`apps/web/src/app/projects/[projectId]/page.tsx`)
renders this as a `stage-nav` strip across the top. **This milestone only
implements Step 1** end to end (transcript submission → segmentation →
segment display with per-segment flags). Steps 2–5 are represented in the
navigation but have no corresponding UI yet — building them is milestone
2–4 work (see `ROADMAP.md`), and each should follow the same pattern:
a server component reading the relevant entity, a server action for any
mutation, no client-side state management framework introduced unless a
concrete interaction requires it.

## Current visual approach

Deliberately minimal for this milestone: a single global stylesheet
(`apps/web/src/app/globals.css`), no component library, no design tokens
file yet. The goal was a legible, functional shell to prove the pipeline
end to end — not a finished visual identity. Concretely:

- System font stack, single-column layout, `max-width: 760px`.
- Forms use native `<label>`/`<input>`/`<textarea>`/`<button>` styled
  generically — no custom form components yet.
- Segments render as bordered cards with a small "flags" line
  (`• topic change`, `• example`, `• promotional`, `• unclear`) directly
  reflecting `TranscriptSegment`'s boolean columns, so the Understand step
  (once built) has a real precedent to extend rather than invent from
  scratch.
- `color-scheme: light dark` is set at the root so the browser's default
  form control theming follows system preference; no explicit dark-mode
  palette has been designed yet.

## What to establish before building Steps 2–5

Not decided yet, and worth deciding deliberately rather than accreting
ad hoc:

- A real color palette and type scale (or an existing library adopted
  wholesale) once there's enough surface area (concept comparison cards,
  script editing, review checklists) to justify one.
- A pattern for editable long-form content (the Master Video script editor
  in Step 4) — likely the highest-complexity UI in the whole product.
- A pattern for side-by-side comparison (the Video Concept angles in
  Step 3, and originality/accuracy/content/brand review findings).

Until then, keep new UI consistent with what exists: server components for
reads, server actions for writes, plain semantic HTML, and the existing
`globals.css` conventions — rather than introducing a second styling
approach.
