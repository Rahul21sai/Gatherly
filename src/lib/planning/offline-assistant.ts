import type {
  AssistantResponse,
  EventInput,
  EventPlan,
  Suggestion,
} from "../types";
import { money } from "../format";
import { ASSISTANT_VENDOR_LEAD_LIMIT } from "./policies";

function appendNote(input: EventInput, note: string): Partial<EventInput> {
  const prefix = input.notes.trim();
  return {
    notes: `${prefix.slice(0, Math.max(0, 1_999 - note.length))}${prefix ? "\n" : ""}${note}`,
  };
}

export function offlineAssistant(
  input: EventInput,
  plan: EventPlan,
  message: string,
): AssistantResponse {
  const text = message.toLowerCase();
  let reply: string;
  let suggestions: Suggestion[] = [];
  if (/rain|weather|outdoor|backup|covered/i.test(text)) {
    reply = `For ${input.title}, reserve a covered or indoor backup that fits all ${input.guests} guests. Ask the venue about access, extra setup charges and a decision time for switching spaces. I cannot check a live weather forecast. Apply the suggestion to add this requirement to your plan.`;
    suggestions = [
      {
        label: "Add a rain backup",
        patch: appendNote(
          input,
          "Rain backup: confirm a covered or indoor space for every guest, accessible routes and a weather decision time.",
        ),
      },
    ];
  } else if (/budget|cost|spend|expens|afford|cheaper|sav(e|ing)/i.test(text)) {
    const requestedReduction = text.match(
      /(?:reduce|cut|lower|decrease)[^\d]{0,30}(\d{1,2})\s*%/,
    );
    const reduction = requestedReduction ? Number(requestedReduction[1]) : 15;
    const reduced = Math.max(
      100,
      Math.round(input.budget * (1 - reduction / 100)),
    );
    const largest = [...plan.budget]
      .filter((item) => item.id !== "contingency")
      .sort((a, b) => b.allocated - a.allocated)[0];
    const spent = plan.budget.reduce((sum, item) => sum + item.spent, 0);
    reply = `Your total budget is ${money(input.budget, input.currency)} for ${input.guests} guests (${money(Math.floor(input.budget / input.guests), input.currency)} each). ${largest ? `${largest.category} is the largest planning allowance at ${money(largest.allocated, input.currency)}. ` : ""}${spent ? `You have recorded ${money(spent, input.currency)} spent. ` : ""}Simplify the format or compare real supplier quotes before reducing guest essentials. Keep the contingency available for surprises.`;
    if (reduction > 0 && reduction < 100 && reduced < input.budget)
      suggestions = [
        { label: `Reduce budget by ${reduction}%`, patch: { budget: reduced } },
      ];
  } else if (/guest|headcount|people|attend|invite|rsvp/i.test(text)) {
    const guests = Math.max(1, Math.floor(input.guests * 0.85));
    reply = `You are planning for ${input.guests} guests in ${input.city}. Keep one RSVP list with dietary and accessibility needs, set a response deadline, and confirm final numbers before catering is locked. At the current budget, the allowance is ${money(Math.floor(input.budget / input.guests), input.currency)} per guest before contingency.`;
    if (guests < input.guests)
      suggestions = [{ label: `Plan for ${guests} guests`, patch: { guests } }];
  } else if (/vendor|supplier|venue|cater|photograph|book|quote/i.test(text)) {
    reply = `Start research with ${plan.vendors
      .slice(0, ASSISTANT_VENDOR_LEAD_LIMIT)
      .map((vendor) => vendor.name.toLowerCase())
      .join(
        ", ",
      )} for ${input.city} on ${input.date}. These are generic partner roles, with internal allowances rather than verified providers or quotes. Check availability for ${input.guests}, what is included, taxes, cancellation terms and references before booking.`;
  } else if (
    /timeline|deadline|date|next|task|schedule|when|time/i.test(text)
  ) {
    const next = plan.tasks.find((task) => !task.completed);
    reply = `The event is on ${input.date}. ${next ? `Your next open task is “${next.title}”, due ${next.dueDate}. ` : "Your current checklist is complete. "}Work through essential venue and supplier decisions first, then guest communication and final quantities. Tasks on the same date can be handled together.`;
  } else {
    reply = `For ${input.title}, I am working with ${input.guests} guests, ${money(input.budget, input.currency)}, ${input.city} and ${input.date}. I can help you weigh the budget, guest count, timeline, supplier requirements or a rain backup. Suggested changes need your Apply action before the plan is regenerated.`;
    suggestions = [
      {
        label: "Add a rain backup",
        patch: appendNote(
          input,
          "Rain backup: confirm a covered or indoor space for every guest, accessible routes and a weather decision time.",
        ),
      },
    ];
  }
  return { reply, suggestions, mode: "offline" };
}
