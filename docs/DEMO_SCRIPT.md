# Gatherly walkthrough — target 3 minutes 45 seconds

Use fictional event details. Rehearse once so the final recording stays under four minutes. Capture the app and your narration; keep environment files, tokens, provider dashboards and personal browser content outside the frame.

## Before recording

- Start the app and verify the exact build being demonstrated.
- Prepare a fictional event, for example “Anaya & Arjun's garden celebration,” in Bengaluru, 120 guests, INR 600,000, with food and photography as priorities. Choose a future date that leaves enough time for a meaningful task timeline.
- Confirm the browser's saved event state and arrange a clean starting view.
- With a configured Gemini key, generate a fresh response and check its returned `mode` before recording. Use the genuine Gemini branch below only if it succeeds. Keep one offline fallback example ready.
- Test the JSON and calendar downloads and know where the browser will save them.

## Timed script

| Time | Show | Suggested narration |
| --- | --- | --- |
| 0:00–0:20 | Overview, event title and main navigation. | “Gatherly turns an event brief into a plan you can work through. It focuses on celebrations: weddings, birthdays and community events.” |
| 0:20–0:50 | New event form; set the prepared details, priorities and budget, then generate. | “I set the date, city, guest count and budget. These constraints drive the plan, and my priorities influence how the budget is allocated.” |
| 0:50–1:20 | Generated Overview, source label, budget total and warnings. | “The planning engine owns the money and dates, so the allocations reconcile to the budget. Any tight-budget or short-timeline warning is visible here.” Then use the relevant source branch below. |
| 1:20–1:55 | Budget; edit one spending value. Timeline; complete one task. Vendors; change one research status. | “I can record actual spend and immediately see what remains. I can complete tasks and track vendor research. These are planning allowances and my own status updates; the app does not make bookings or claim live vendor prices.” |
| 1:55–2:20 | Ideas; save one idea. Switch events and return, or reload to show persistence. | “Ideas can be saved alongside the plan. Each event keeps its own progress in this browser, and I can switch between events without losing those edits.” |
| 2:20–3:05 | Assistant; ask for a constraint change, inspect its proposal and demonstrate reset confirmation. | “The assistant proposes changes instead of silently rewriting the event. I can review the new constraint and cancel. If I apply it, Gatherly warns that a fresh plan resets tracked progress.” Show cancel first. Confirm only if the live proposal exists and there is time. |
| 3:05–3:30 | JSON and calendar export; briefly show downloads. | “I can export the complete plan as JSON and download dated tasks for calendar import. There is no external calendar sync or account required.” |
| 3:30–3:45 | Responsive view or compact mobile layout, then Overview. | “The workspace also works on a narrow screen. Gatherly combines reliable planning calculations with optional Gemini enrichment, while keeping source, assumptions and user control visible.” |

## Source branch at 0:50–1:20

**When Gemini is verified:** Point to the real source label after a fresh successful request. Say: “This response used Gemini for the tailored summary and ideas. The server validates that enrichment, while the deterministic engine retains the financial totals and dates.” If practical, briefly show the response's `mode: "gemini"` in the browser network panel, without exposing request headers or secrets. A label alone should not be used as proof if it does not match the response.

**When no working key or provider response is available:** Say: “This is the deterministic fallback, clearly labelled offline. The planning flow still works, but this recording does not claim a successful live Gemini call.” Do not edit a label, reuse a fabricated response or imply that a configured key proves provider success. If the challenge requires live Gemini proof, keep that submission item pending until it is genuinely demonstrated.

## Rehearsal checks

- End by 3:45, leaving a small margin below the four-minute limit.
- Spend time on the user outcome; keep setup commands and source inspection out of the walkthrough unless explicitly required by the portal.
- Demonstrate only behavior that works in the current build. If a live assistant proposal differs from the rehearsal, describe what is actually shown.
- Use the same final build and URLs recorded in the submission checklist.
- Prepare any Instagram Reel separately according to that promotional instruction; this walkthrough is the main code-submission demonstration.
