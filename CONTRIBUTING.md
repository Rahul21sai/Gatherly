# Contributing

Use Node22 and `npm ci`. Run `npm run quality` and `npm run build` before committing. Browser changes also require `npm run test:e2e`; its isolated server uses the offline planner, so tests do not need credentials or provider access.

## Code standards

- Organize code by responsibility. Feature panels own their presentation; the workspace controller owns state transitions; planning modules own domain policies and calculations; server modules own provider access and request validation.
- Keep calculations pure and preserve financial invariants. Budget allocations must reconcile exactly in whole currency units, with the existing rounded contingency policy.
- Treat network and stored data as unknown. Validate it with Zod before use; avoid unchecked response casts, explicit `any` and non-null assertions.
- Use named props and types, descriptive identifiers and meaningful constants. Prefer a small, useful interface to pass-through wrappers or speculative abstractions.
- Preserve the distinction between planning estimates and real supplier quotes. Never imply a booking or silently apply an assistant proposal.
- Use existing formatting and semantic HTML, label inputs and preserve keyboard focus. Keep source provenance and responsive behavior visible in reviews.
- Test observable behavior and regressions. Avoid tests that reproduce implementation details. External-provider failure must leave a usable, correctly labelled fallback.
- Keep Gemini credentials on the server and out of source, screenshots and logs. `.env.local`, `.vercel`, generated media and build outputs remain ignored.

The challenge repository must stay public, below10MB and on one branch (`main`). Portal submission remains a separate manual action. CI has read-only repository permissions and uses no live AI credential.
