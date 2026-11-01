import type { EventInput, EventPlan, PlanTask } from "./types";
import { planningToday } from "./dates";
import { money } from "./format";
import {
  allocations,
  ideaTemplates,
  taskTemplates,
} from "./planning/configuration";
import { allocateBudget } from "./planning/budget";
import {
  COMFORTABLE_LEAD_DAYS,
  PER_GUEST_FLOOR,
  VENDOR_LEAD_LIMIT,
  contingencyAmount,
} from "./planning/policies";

export { offlineAssistant } from "./planning/offline-assistant";

const DAY_MILLISECONDS = 86_400_000;

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}
function dayStart(date: Date) {
  return new Date(`${planningToday(date)}T00:00:00.000Z`);
}

export function buildPlan(
  input: EventInput,
  now: Date = new Date(),
): EventPlan {
  const today = dayStart(now);
  const eventDay = new Date(`${input.date}T00:00:00.000Z`);
  const days = Math.max(
    0,
    Math.round((eventDay.getTime() - today.getTime()) / DAY_MILLISECONDS),
  );
  const budget = allocateBudget(input);
  const tasks: PlanTask[] = taskTemplates[input.eventType].map(
    ([title, daysBefore, category], index) => ({
      id: `task-${input.eventType}-${index + 1}`,
      title,
      dueDate: isoDay(
        new Date(
          Math.max(
            today.getTime(),
            eventDay.getTime() - daysBefore * DAY_MILLISECONDS,
          ),
        ),
      ),
      category,
      completed: false,
    }),
  );
  const warnings: string[] = [];
  const comfortableLead = COMFORTABLE_LEAD_DAYS[input.eventType];
  if (days < comfortableLead)
    warnings.push(
      `Your timeline is ${days === 0 ? "today" : `${days} days`}. Confirm the venue, essential suppliers and guest communication first; several tasks may share a deadline.`,
    );
  const perGuestFloor = PER_GUEST_FLOOR[input.currency][input.eventType];
  if (
    (input.budget - contingencyAmount(input.budget)) / input.guests <
    perGuestFloor
  ) {
    warnings.push(
      `Your planning allowance is ${money(Math.floor(input.budget / input.guests), input.currency)} per guest before contingency. Consider a simpler format, contributed resources or fewer guests. These allocations are planning targets, not supplier quotes.`,
    );
  }
  if (
    /outdoor|garden|rooftop|beach|lawn|terrace|open.air/i.test(
      `${input.style} ${input.notes}`,
    )
  ) {
    warnings.push(
      /rain backup|indoor backup|covered backup|weather backup/i.test(
        input.notes,
      )
        ? "A weather backup is noted. Confirm indoor capacity, access and the rain decision time with your venue."
        : "An outdoor celebration needs a rain backup. Confirm a covered or indoor space for every guest and a weather decision time; no live forecast is connected.",
    );
  }
  const vendors = allocations[input.eventType]
    .slice(0, VENDOR_LEAD_LIMIT)
    .map((item, index) => {
      const allocation = budget[index];
      if (allocation?.id !== item.id) {
        throw new Error(`Missing budget allocation for ${item.id}`);
      }
      return {
        id: `vendor-${item.id}`,
        category: item.category,
        name: item.partner,
        status: "To research" as const,
        estimate: allocation.allocated,
        questions: [
          `Are you available in ${input.city} on ${input.date} for ${input.guests} guests?`,
          "What is included, and which taxes, travel or setup charges are extra?",
          "What are the deposit, cancellation and weather-backup terms?",
        ],
      };
    });
  const eventLabel =
    input.eventType === "community" ? "community gathering" : input.eventType;
  return {
    id: `event-${globalThis.crypto?.randomUUID?.() ?? `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`}`,
    input: { ...input, priorities: [...input.priorities] },
    summary: `A ${input.style || "thoughtfully planned"} ${eventLabel} in ${input.city} for ${input.guests} guests, with ${money(input.budget, input.currency)} to work with. Start with ${input.priorities.length ? input.priorities.join(", ").toLowerCase() : "the venue, food and guest experience"}; keep a 10% contingency, rounded to the nearest whole currency unit. Supplier amounts are internal planning allowances until you receive real quotes.`,
    budget,
    tasks,
    vendors,
    ideas: ideaTemplates[input.eventType].map((idea, index) => ({
      ...idea,
      id: `idea-${input.eventType}-${index + 1}`,
      saved: false,
    })),
    warnings,
    source: "offline",
    generatedAt: now.toISOString(),
  };
}
