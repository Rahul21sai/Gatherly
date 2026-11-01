# Gatherly design

Build a submission-ready Celebration & Event Planner for weddings, birthdays, and community events. The user explicitly requested a challenge prompt and to start building. Implementation choices below are builder defaults.

User decisions during implementation: use Gemini, with the owner adding the key locally; keep the build local for now. Public repository creation, deployment and portal submission are deferred.

## Product
An event workspace starts with a sample wedding, with a clear New event action. A guided form captures title, type, date, city, guest count, total budget/currency, style, priorities, and notes. Generate a budget, dated tasks, vendor requirements and tailored ideas. Tabs expose editable budget spend, task completion, vendor status, and saved ideas. An assistant answers questions and proposes explicit constraint edits; applying one regenerates a plan after warning that tracked progress resets. Export JSON and a calendar file. Persist the workspace in the current browser, recover from corrupt storage, and support multiple saved events.

## Architecture
Next.js App Router / TypeScript. A deterministic planning engine owns all arithmetic, allocations, dates, and feasibility warnings. Gemini is called only from the server, with schema-validated bounded input/output, timeout and clear offline fallback. No fabricated real vendors, prices, bookings, integrations, or AI claims. Gemini enriches summaries and ideas, never computes totals. No accounts or external database for the MVP.

## Visual direction
Pearl #F7F7FB, white #FFFFFF, ink #242334, violet #7761C9, pale lilac #EEEAF8, peach #F3D3C0. DM Sans body with a restrained Georgia display headline. A fixed slim sidebar, generous header, photographic celebration banner, purposeful metrics, budget/task overview and a compact assistant column. Violet emphasis, quiet separators, radius varies by hierarchy. Botanical celebration photography is decorative and has an intentional fallback. Accessible keyboard focus, labels, semantic headings, reduced motion and mobile drawer layout.

## Constraints
One Git branch named main. Public repository under 10 MB, no secrets or generated artifacts. README covers chosen vertical, approach, logic, setup and assumptions. Demo walkthrough less than 4 minutes. Test meaningful financial/date boundaries and malformed API data; verify flows in a real desktop and mobile browser. Repository publication, deployment and portal submission must be reported truthfully; never consume a submission attempt automatically.
