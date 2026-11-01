# Gatherly submission checklist

This file records release evidence. Unchecked items are unverified, not implied successes. Complete it against the final checkout and the actual portal instructions before submitting.

## Submission identity

| Item | Verified value |
| --- | --- |
| Chosen vertical | Celebration & Event Planning |
| Product | Gatherly |
| Public repository URL | Deferred: owner requested a local build |
| Deployment URL, if submitted | Deferred: owner requested a local build |
| Verified application revision | `2b8f420`; later changes document evidence and format tests |
| Walkthrough URL or file | `docs/DEMO_SCRIPT.md`; recording not created |
| Walkthrough duration | Script targets 3:45; actual recording remains pending |
| Final verification date | November 1, 2026 |

## Product and problem fit

- [x] All three event types produce valid plans; browser creation and editing are exercised with a birthday event.
- [x] Budget allocations sum exactly to the input budget in whole currency units.
- [x] Tight-budget and short-timeline cases show assumptions and warnings.
- [x] Overview, Budget, Timeline, Vendors and Inspiration work.
- [x] Spending, task completion, vendor status and saved ideas are editable. Browser reload preserves the saved plan and spending.
- [x] Events use separate identities, and reload selects the latest saved event rather than the sample.
- [x] Corrupt stored data is rejected safely by the storage parser.
- [x] Assistant advice displays proposals before applying them.
- [x] Confirmation explicitly warns about resetting progress; the browser test applies an approved change.
- [x] JSON, Markdown and calendar files download through the actual browser controls. Calendar text preserves all-day dates; external calendar import was not attempted.
- [x] Vendor requirements, allowances and user-tracked statuses are described without live booking or market-price claims.

## Gemini and security

- [ ] A real Gemini request succeeds from the final environment, with response `mode: "gemini"` matching the UI source label.
- [x] The real missing-key flow works. Controlled API tests cover provider failure with truthful offline provenance.
- [x] Invalid, malformed and oversized requests fail safely; malformed provider output cannot override calculations.
- [x] Requests and model output are bounded, with a provider timeout and safe public errors.
- [x] `.env.local` is ignored; staged credential-pattern checks and the commit secret scanner found no secrets.
- [x] App screenshots contain only fictional event data. No recording was created.
- [x] The README explains local storage, Gemini data flow, the process-local limiter and public deployment limits.
- [ ] Public deployment abuse controls and provider billing settings have been reviewed for the intended sharing scope.

If the live Gemini item remains unchecked, describe the integration as implemented but unverified. Do not replace it with a mock success or claim full challenge readiness where live Gemini proof is required.

## Code quality, efficiency and accessibility

- [x] Shared contracts pass TypeScript checks; financial/date logic remains centralized.
- [x] Tabs and progress updates use local state rather than model calls.
- [x] Loading/error states work; the busy-dialog Escape regression is covered in the browser.
- [x] Desktop and touch-enabled 375px mobile layouts were inspected, including navigation and overflow.
- [ ] Keyboard users can create an event, navigate views, edit progress and operate dialogs with visible focus.
- [x] Forms have labels; chart/status information has readable text equivalents.
- [x] Axe WCAG 2 A/AA and 2.1 AA checks pass on Overview, Budget, Timeline, Vendors, Inspiration and the event form.

## Verification evidence

Fill in the observed result and any remaining issue. Do not mark a command passed merely because it is documented.

| Check | Command / method | Actual result |
| --- | --- | --- |
| Types | `npm run typecheck`, production type checking | Pass |
| Lint | ESLint on source, tests and configuration; new export test rechecked | Pass, zero errors/warnings |
| Unit and API tests | `npm test` | 54 passed in 4 files |
| Production build | `npm run build` | Pass; all three API routes and the app compile |
| Browser flows | Full 5-scenario suite plus targeted export scenario against `npm start` | All 6 passed |
| Desktop inspection | Production screenshot and main flows | Pass at 1280px |
| Mobile inspection | Touch context at 375px, menu and budget view | Pass, no document overflow |
| Keyboard/accessibility | Native controls, Escape regression and Axe scans | Automated checks pass; full manual assistive-technology review not performed |
| Genuine Gemini | Fresh provider response and matching UI source | Pending: no key configured |
| Provider fallback | Real missing-key flow plus controlled provider tests | Pass |
| Export inspection | Browser downloads and content checks | JSON, Markdown, ICS pass; no external calendar write/import |
| Dependencies | `npm audit --omit=dev --audit-level=high` | Zero known vulnerabilities |
| Browser runtime | Production export flow, console/page errors and loaded images | No errors or broken loaded images observed |

## Repository and deployment

- [ ] Public repository is accessible in an anonymous browser session.
- [x] Exactly one local branch exists: `main`. Public branch verification is deferred with publication.
- [x] Tracked source/assets and the source ZIP are below 10 MB. Verify the portal's host-size interpretation when publishing.
- [x] Dependencies, builds, reports, downloads and secrets are excluded from tracked files.
- [x] README explains the vertical, logic, assumptions, setup, verification and deployment.
- [x] Clean `npm ci` and the documented production startup succeeded locally. A remote fresh-clone check is deferred because no public repository was created.
- [ ] Any submitted deployment URL loads anonymously and its server routes function.
- [ ] Host environment values are configured privately, and genuine Gemini/fallback checks are repeated on the deployment if submitted.

Measured application revision `2b8f420`: **898,066 tracked bytes**, **555,477-byte source ZIP**. Subsequent evidence-only changes keep the project below 1 MB. Local branch evidence: `git branch --list` returns only `main`. Public access is intentionally unverified.

## Recording and portal

- [ ] Walkthrough is shorter than four minutes and demonstrates the final build.
- [ ] The walkthrough shows the event-to-plan-to-progress-to-assistant-to-export flow with fictional data.
- [ ] Any Gemini success claimed in narration is backed by a genuine response.
- [ ] The main code submission includes the required repository and walkthrough materials.
- [ ] Screenshot 1's Instagram Reels instruction is handled as a separate promotional item, according to its own requirements.
- [ ] Final portal fields, allowed formats and deadlines are checked directly before submission.
- [ ] A person reviews the prepared entry before choosing to submit.

The challenge permits **at most three submission attempts**. This checklist does not submit the entry or consume an attempt. Keep all material ready before using one.

| Attempt | Date | What changed / portal result |
| --- | --- | --- |
| 1 | Not used or not recorded | Confirm actual portal history before submitting |
| 2 | Not used or not recorded | Confirm actual portal history before submitting |
| 3 | Not used or not recorded | Confirm actual portal history before submitting |

## Remaining limitations to disclose

Record any unmet requirement, unverified provider behavior, failed check or unavailable deployment here before submitting. Preserve the distinction between implemented code, locally verified behavior and externally published evidence.

**Current evidence status:** Local implementation and verification are complete. Live Gemini proof requires a key. Public repository creation, deployment, recording, manual assistive-technology review and portal submission remain pending; the owner requested keeping this build local for now. No submission attempt was made.
