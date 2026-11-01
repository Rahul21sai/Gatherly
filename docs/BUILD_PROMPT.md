# Gatherly — reusable challenge build prompt

Copy the prompt below into a coding agent working in the project folder. It captures the chosen vertical, implementation boundaries and measurable judging criteria. The product design in `docs/superpowers/specs/2026-11-01-gatherly-design.md` and the shared types in `src/lib/types.ts` are the local sources of truth when continuing this implementation.

---

Build **Gatherly**, a polished Celebration & Event Planner for weddings, birthdays and community events. First write a short implementation plan, then start building. Deliver a usable vertical slice and finish the verification and submission documents. Make sensible implementation choices from this brief and record assumptions.

## Outcome

A user enters an event brief, gets a coherent budget and dated plan, edits progress, asks for planning advice and exports their work. The experience should feel like a premium event workspace with a clear next action at every stage. Every primary control must produce a real, reviewable result.

Use Next.js App Router, TypeScript, React, Zod, Vitest and Playwright. Keep the data model small and explicit. Use the existing project if present; inspect its scripts, design and shared contracts before changing it.

## Plan the build

1. Inspect the workspace and identify any existing user changes. Write a compact plan covering the planning engine, API boundary, UI, persistence, exports and verification.
2. Build the deterministic core and validate its money/date boundaries. Complete a working brief-to-plan flow before adding polish.
3. Add Gemini enrichment on the server and keep fallback mode visibly truthful.
4. Complete editing, event switching, assistant proposals, exports, responsive design and accessibility.
5. Run appropriate checks, resolve failures, document actual outcomes and prepare the submission materials. Report any remaining blocker precisely.

Finish each step with a working result or explicit verification evidence. Parallelize independent work when useful, keeping shared contracts consistent.

## Product requirements

### Event creation and workspace

- Start with a sample wedding and a clear New event action.
- Capture title, event type, date, city, guests, total budget, currency, style, priorities and notes.
- Support wedding, birthday and community events; INR, USD and EUR; multiple saved events in one browser.
- Offer Overview, Budget, Timeline, Vendors and Ideas views, with a visible assistant.
- Preserve edits across reloads. Safely recover from corrupt or incompatible stored data, explaining the recovery if data cannot be kept.
- Keep empty, loading, validation-error and failure states actionable.

### Budget, timeline and progress

- Use a deterministic TypeScript function for all money, category allocation, reserve policy, dates and feasibility warnings. Document the policy and use currency precision so category totals reconcile exactly to the input budget.
- Let priorities influence allocation consistently. Expose planned, spent and remaining values without concealing overspend.
- Allow users to edit spending, complete tasks, update vendor status and save/unsave ideas.
- Generate tasks relative to the event date. Handle short lead times and calendar boundaries without misleading overdue dates or time-zone shifts.
- Label vendor entries as research requirements or placeholders. Their amounts are planning allowances, never market quotes. User-set vendor status is a tracker and performs no booking.
- Provide useful warnings for tight budgets, high guest counts and compressed schedules. State the assumptions rather than claiming a precise real-world cost model.

### Gemini and assistant

- Implement `POST /api/plan` with `{ input }` and return `PlanResponse`.
- Implement `POST /api/assistant` with `{ input, plan, message }` and return `AssistantResponse`.
- Read `GEMINI_API_KEY` and optional `GEMINI_MODEL` on the server only. Default model: `gemini-2.5-flash`.
- Keep financial values and task dates under deterministic control. Gemini may enrich the summary, celebration ideas and advisory language.
- Validate bounded input and structured output at runtime, set a provider timeout, and handle missing credentials, network failures and malformed output.
- Return and visibly display whether each result used Gemini or the deterministic fallback. A fallback response must never be presented as a successful AI call.
- Treat user notes, assistant messages and model output as untrusted content. Render plain text through React; use no generated HTML or executable model instructions.
- Assistant responses may propose explicit `Partial<EventInput>` constraint patches. Show the proposed changes first. Apply a patch only after the user confirms that regenerating the plan resets spending, task completion, vendor status and saved ideas for that event. Cancellation must preserve existing progress.
- Do not imply live search, vendor contact, bookings, payments or external actions.

### Persistence and export

- Use local browser storage for the workspace; no accounts or external database in this MVP.
- Keep event IDs and selected-event state stable while switching events.
- Download the full plan as JSON and dated tasks as a valid calendar file. Clearly present these as downloads, without implying external calendar sync.
- Explain that clearing browser data can remove local events and that JSON export provides a portable copy.

## Visual and interaction direction

Use pearl `#F7F7FB`, white `#FFFFFF`, ink `#242334`, violet `#7761C9`, pale lilac `#EEEAF8` and peach `#F3D3C0`. Use DM Sans for body text and restrained Georgia display headlines. Compose a slim sidebar, generous header, decorative celebration photography, purposeful metrics, a budget/task overview and a compact assistant panel. Include an intentional image fallback.

Keep hierarchy and spacing deliberate. Use violet for the primary action and selected state, quiet separators and distinct surfaces. On narrow screens, use a usable drawer or equivalent navigation and a single-column reading order. Ensure labels, dates, currency values and long event names remain readable.

Support semantic headings, visible labels, keyboard operation, focus indicators, accessible dialogs, meaningful error associations, sufficient contrast and reduced motion. Use charts with text equivalents and avoid encoding status through color alone.

## Judging criteria → implementation and evidence

| Criterion | Required implementation | Evidence to collect |
| --- | --- | --- |
| Code quality | Shared typed contracts; small modules for planning, validation, provider integration, storage and exports; clear naming; minimal dependencies; useful error handling. | Passing type/lint/build results, readable structure and README decisions. |
| Security | Server-only secret, runtime validation, bounded bodies and model output, provider timeout, safe text rendering, generic public errors, no committed sensitive data. State the public endpoint's abuse-control limits. | Malformed-input and provider-failure checks; inspect tracked files and client output for secrets; document data flow. |
| Efficiency | Immediate deterministic calculation; one deliberate enrichment request per action; bounded context; avoid repeated provider calls on tab changes; compact persisted data; clear loading state. | Observe requests during a complete user flow and describe the deterministic/provider split. Avoid unsupported latency or cost claims. |
| Testing | Meaningful tests of arithmetic, dates, validation, fallback and user flows; fix found failures. | Exact commands and observed results, plus desktop/mobile browser evidence. |
| Accessibility | Keyboard-friendly navigation and forms, focus handling, semantic structure, readable contrast, responsive layout and reduced motion. | Automated accessibility findings plus a manual keyboard/mobile check; resolve actionable failures. |
| Problem alignment | An event brief becomes a coherent editable plan; progress persists; proposed changes are reviewed; exports work; provenance and limits are clear. | A focused walkthrough demonstrating the full loop with a realistic fictional event. |

## Verification requirements

- Financial checks: every event type, small/large valid budgets, fractional currency inputs, exact allocation reconciliation, reserve behavior and overspend visibility.
- Date checks: near-date events, month/year transitions, leap dates where supported and calendar export dates. Use a controllable reference date for reproducibility.
- API checks: missing/invalid fields, unsupported values, out-of-range numbers, oversized bodies, invalid JSON, missing key, provider timeout/failure and malformed model output.
- Browser checks: creation, view navigation, event switching, reload persistence, editable spend/tasks/vendors/ideas, proposal cancel/confirm behavior, exports and corrupt-storage recovery at desktop and mobile sizes.
- Accessibility checks: keyboard path through the main flow, dialog focus, labels and automated checks against the rendered UI.
- Run available typecheck, lint, unit/API tests, production build and browser tests. Report only observed results; a command in documentation is not a passed check.
- Verify genuine Gemini behavior only with a working key. Show returned `mode: "gemini"` and the corresponding UI source label without exposing secrets. If the provider is unavailable, report that integration remains unverified and show the truthful fallback.

## Deliverables and boundaries

- Working app and source in the current project folder.
- README covering the vertical, approach, deterministic logic, setup, data flow, assumptions, test commands and deployment procedure.
- A walkthrough script shorter than four minutes and a submission checklist with evidence gates.
- A repository ready for public review, below 10 MB, with a single branch named `main`. Exclude secrets, dependencies, generated builds, test reports and recordings from tracked files.
- Record verified repository and deployment URLs only after they exist and are anonymously reachable. Preserve authorization boundaries for publishing or deploying.
- Treat the screenshot 1 Instagram Reels instruction as a separate promotional item. Do not substitute it for the main code submission.
- The challenge allows at most three submission attempts. Prepare all materials before the user chooses to submit; never use an attempt automatically.

Completion means the brief-to-plan-to-edits-to-export flow works, meaningful verification has been run, the documentation reflects observed behavior, and any unavailable external service or submission step is stated honestly.

---

## Use with this repository

The prompt is reusable; the current implementation's exact contract is `src/lib/types.ts`. Preserve its `EventPlan.source`, response `mode`, input enums and proposal patch shape unless a deliberate coordinated change updates both the API and UI. The evidence checklist, rather than this prompt, records the checkout's verified state.
