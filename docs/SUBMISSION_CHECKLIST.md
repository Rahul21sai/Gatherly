# Gatherly submission checklist

This file records release evidence. Unchecked items are unverified, not implied successes. Complete it against the final checkout and the actual portal instructions before submitting.

## Submission identity

| Item | Verified value |
| --- | --- |
| Chosen vertical | Celebration & Event Planning |
| Product | Gatherly |
| Public repository URL | Pending verification |
| Deployment URL, if submitted | Pending verification |
| Final revision / commit | Pending verification |
| Walkthrough URL or file | Pending verification |
| Walkthrough duration | Pending verification; must be under 4 minutes |
| Final verification date | Pending verification |

## Product and problem fit

- [ ] A user can create a wedding, birthday and community event from valid inputs.
- [ ] Budget allocations sum exactly to the input budget at currency precision.
- [ ] Tight-budget and short-timeline cases show useful assumptions and warnings.
- [ ] Overview, Budget, Timeline, Vendors and Ideas each work.
- [ ] Spending, task completion, vendor status and saved ideas are editable and persist.
- [ ] Multiple events can be saved, switched and reloaded without mixing their state.
- [ ] Corrupt stored data recovers without a blank or broken app.
- [ ] Assistant advice displays proposals before applying them.
- [ ] Cancelling regeneration preserves progress; confirming clearly resets the current event's progress.
- [ ] JSON contains the exported plan; calendar export imports as expected and preserves planning dates.
- [ ] Vendor placeholders, allowances and user-tracked status are clearly described; no live bookings or market-price claims appear.

## Gemini and security

- [ ] A real Gemini request succeeds from the final environment, with response `mode: "gemini"` matching the UI source label.
- [ ] Missing key or provider failure produces a useful response with truthful offline provenance.
- [ ] Invalid, malformed and oversized requests fail safely; malformed provider output cannot override money/date calculations.
- [ ] Requests and model output are bounded, with a provider timeout and safe public errors.
- [ ] The key stays in an ignored local environment file or host secret settings; client output and tracked files contain no secrets.
- [ ] The recording and screenshots expose no tokens, private personal data or unrelated work content.
- [ ] The README explains browser-local storage, the Gemini data flow and limits of public API access controls.
- [ ] Public deployment abuse controls and provider billing settings have been reviewed for the intended sharing scope.

If the live Gemini item remains unchecked, describe the integration as implemented but unverified. Do not replace it with a mock success or claim full challenge readiness where live Gemini proof is required.

## Code quality, efficiency and accessibility

- [ ] Shared contracts match the UI and API; financial/date logic remains centralized.
- [ ] Tab changes and local progress edits do not trigger unnecessary Gemini requests.
- [ ] Loading and error states prevent ambiguous duplicate actions and explain recovery.
- [ ] Desktop and narrow mobile layouts are visually inspected for clipping, overflow and usable navigation.
- [ ] Keyboard users can create an event, navigate views, edit progress and operate dialogs with visible focus.
- [ ] Forms have labels and useful errors; chart/status information has readable text equivalents.
- [ ] Automated accessibility findings are reviewed and actionable failures resolved.

## Verification evidence

Fill in the observed result and any remaining issue. Do not mark a command passed merely because it is documented.

| Check | Command / method | Actual result |
| --- | --- | --- |
| Types | `npm run typecheck` | Not recorded |
| Lint | `npm run lint` | Not recorded |
| Unit and API tests | `npm test` | Not recorded |
| Production build | `npm run build` | Not recorded |
| Browser flows | `npm run test:e2e` | Not recorded |
| Desktop inspection | Main flow and screenshots | Not recorded |
| Mobile inspection | Main flow at narrow width | Not recorded |
| Keyboard/accessibility | Manual path and automated checks | Not recorded |
| Genuine Gemini | Fresh provider response and matching UI source | Not recorded |
| Provider fallback | Missing key or controlled provider failure | Not recorded |
| Export inspection | Open JSON; inspect/import calendar file | Not recorded |

## Repository and deployment

- [ ] Public repository is accessible in an anonymous browser session.
- [ ] Exactly one branch exists for the challenge and it is named `main`; check local and public repository branches.
- [ ] The complete tracked submission is below 10 MB according to the portal's interpretation; record the measured byte count below. If the portal counts an archive or repository size differently, verify that too.
- [ ] Dependencies, build folders, coverage, test reports, browser downloads, recordings and secrets are excluded from tracked files.
- [ ] README explains the selected vertical, approach, logic, assumptions, setup, verification and deployment.
- [ ] A fresh clone installs and starts with the documented instructions.
- [ ] Any submitted deployment URL loads anonymously and its server routes function.
- [ ] Host environment values are configured privately, and genuine Gemini/fallback checks are repeated on the deployment if submitted.

Measured tracked size: **Not recorded**. Public access and branch evidence: **Not recorded**.

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

**Current evidence status:** Final check results, live Gemini proof, repository publication and deployment links have not been recorded in this document.
