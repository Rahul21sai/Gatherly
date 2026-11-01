import type {
  AssistantResponse,
  BudgetItem,
  EventInput,
  EventPlan,
  EventType,
  Idea,
  PlanTask,
  Suggestion,
} from "./types";
import { planningToday } from "./dates";

const DAY = 86_400_000;
const colors = [
  "#7761C9",
  "#B59BDC",
  "#E7BDA7",
  "#A4B7AC",
  "#D9C68F",
  "#99AEC8",
  "#D7D2E5",
];
type Allocation = {
  id: string;
  category: string;
  weight: number;
  aliases: string[];
  partner: string;
};
type TaskTemplate = [title: string, daysBefore: number, category: string];

const allocations: Record<EventType, Allocation[]> = {
  wedding: [
    {
      id: "venue",
      category: "Venue & setup",
      weight: 25,
      aliases: ["venue", "location", "comfort"],
      partner: "Venue partner",
    },
    {
      id: "food",
      category: "Food & drink",
      weight: 30,
      aliases: ["food", "catering", "drink", "dining"],
      partner: "Catering partner",
    },
    {
      id: "design",
      category: "Design & flowers",
      weight: 15,
      aliases: ["decor", "design", "flower", "atmosphere", "aesthetic"],
      partner: "Design partner",
    },
    {
      id: "photo",
      category: "Photography",
      weight: 12,
      aliases: ["photo", "video", "memories"],
      partner: "Photography partner",
    },
    {
      id: "entertainment",
      category: "Music & moments",
      weight: 10,
      aliases: ["music", "entertainment", "experience"],
      partner: "Music partner",
    },
    {
      id: "hospitality",
      category: "Guest hospitality",
      weight: 8,
      aliases: ["guest", "hospitality", "accessibility", "inclusive"],
      partner: "Hospitality partner",
    },
  ],
  birthday: [
    {
      id: "venue",
      category: "Venue & setup",
      weight: 20,
      aliases: ["venue", "location", "comfort"],
      partner: "Venue partner",
    },
    {
      id: "food",
      category: "Food & cake",
      weight: 30,
      aliases: ["food", "cake", "catering", "drink"],
      partner: "Food & cake partner",
    },
    {
      id: "design",
      category: "Decor & details",
      weight: 18,
      aliases: ["decor", "design", "atmosphere", "theme"],
      partner: "Decor partner",
    },
    {
      id: "entertainment",
      category: "Activities & music",
      weight: 18,
      aliases: ["music", "entertainment", "activities", "fun", "experience"],
      partner: "Activities partner",
    },
    {
      id: "photo",
      category: "Photography",
      weight: 9,
      aliases: ["photo", "video", "memories"],
      partner: "Photography partner",
    },
    {
      id: "invitations",
      category: "Invitations & favors",
      weight: 5,
      aliases: ["invitation", "favor", "guest"],
      partner: "Stationery partner",
    },
  ],
  community: [
    {
      id: "venue",
      category: "Venue & permits",
      weight: 20,
      aliases: ["venue", "location", "permit"],
      partner: "Venue partner",
    },
    {
      id: "food",
      category: "Food & refreshments",
      weight: 25,
      aliases: ["food", "catering", "drink", "refreshment"],
      partner: "Refreshments partner",
    },
    {
      id: "equipment",
      category: "Equipment & sound",
      weight: 20,
      aliases: ["sound", "equipment", "music", "production"],
      partner: "Equipment partner",
    },
    {
      id: "program",
      category: "Program & activities",
      weight: 15,
      aliases: ["program", "activities", "entertainment", "experience"],
      partner: "Program partner",
    },
    {
      id: "outreach",
      category: "Outreach & signage",
      weight: 10,
      aliases: ["outreach", "promotion", "signage", "community"],
      partner: "Print & signage partner",
    },
    {
      id: "access",
      category: "Accessibility & safety",
      weight: 10,
      aliases: ["accessibility", "safety", "inclusive", "comfort", "guest"],
      partner: "Access & safety partner",
    },
  ],
};

const taskTemplates: Record<EventType, TaskTemplate[]> = {
  wedding: [
    ["Agree the ceremony format and first guest list", 90, "Planning"],
    ["Research venue availability, access and cancellation terms", 75, "Venue"],
    ["Request catering menus and dietary options", 60, "Food & drink"],
    ["Choose photography coverage and key moments", 45, "Photography"],
    ["Plan flowers, ceremony details and music", 30, "Design"],
    ["Send invitations and collect RSVPs", 21, "Guests"],
    ["Confirm headcount, suppliers and weather backup", 7, "Logistics"],
    ["Share the ceremony and reception run of show", 1, "Event day"],
  ],
  birthday: [
    ["Choose the birthday theme and guest list", 45, "Planning"],
    ["Confirm the venue, access and party timings", 35, "Venue"],
    ["Invite guests and collect dietary requirements", 21, "Guests"],
    ["Plan games, music and age-appropriate activities", 14, "Activities"],
    ["Order the birthday cake and confirm food quantities", 10, "Food & cake"],
    ["Prepare decorations and a photo corner", 7, "Decor"],
    ["Confirm RSVPs and the cake-cutting schedule", 3, "Logistics"],
    ["Set up the welcome, activity and cake stations", 0, "Event day"],
  ],
  community: [
    ["Check venue permissions, permits and public capacity", 45, "Venue"],
    ["Map accessible routes, toilets and the site layout", 35, "Accessibility"],
    ["Recruit volunteers and assign clear shift leads", 30, "Volunteers"],
    ["Confirm the community program and activity hosts", 21, "Program"],
    ["Publish invitations and share access information", 14, "Outreach"],
    ["Confirm equipment, sound and refreshment quantities", 7, "Suppliers"],
    ["Review weather cover, first aid and emergency contacts", 3, "Safety"],
    ["Brief volunteers and check the welcome desk", 0, "Event day"],
  ],
};

const ideaTemplates: Record<EventType, Array<Omit<Idea, "id" | "saved">>> = {
  wedding: [
    {
      title: "A table full of stories",
      description:
        "Name tables after places or memories you share. Add one short story to each place card.",
      tag: "Personal touch",
      color: "#EEEAF8",
    },
    {
      title: "A gentle golden-hour pause",
      description:
        "Leave a short unhurried break for portraits and refreshments between the ceremony and the meal.",
      tag: "Guest experience",
      color: "#F7E9DF",
    },
    {
      title: "One beautiful focal point",
      description:
        "Focus flowers and reusable decor around the ceremony, then move them to the reception.",
      tag: "Budget mindful",
      color: "#EAF0EC",
    },
  ],
  birthday: [
    {
      title: "The birthday time capsule",
      description:
        "Invite each guest to leave a favorite memory or a wish to open at the next birthday.",
      tag: "Personal touch",
      color: "#EEEAF8",
    },
    {
      title: "A choose-your-own activity corner",
      description:
        "Offer one lively game and one quieter creative station so guests can join at their own pace.",
      tag: "Guest experience",
      color: "#F7E9DF",
    },
    {
      title: "Cake as the centerpiece",
      description:
        "Build a small, considered display around the cake using a limited color palette and reusable decorations.",
      tag: "Budget mindful",
      color: "#EAF0EC",
    },
  ],
  community: [
    {
      title: "A neighborhood story wall",
      description:
        "Create an accessible shared wall for local memories, ideas and offers of help. Provide pens and a seated option.",
      tag: "Connection",
      color: "#EEEAF8",
    },
    {
      title: "A warm welcome in every direction",
      description:
        "Give volunteers simple name badges and place clear, readable signs at each entrance and key facility.",
      tag: "Accessibility",
      color: "#F7E9DF",
    },
    {
      title: "Bring, share, reuse",
      description:
        "Ask participants to lend reusable equipment or contribute a small activity; confirm responsibilities before the day.",
      tag: "Budget mindful",
      color: "#EAF0EC",
    },
  ],
};

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}
function dayStart(date: Date) {
  return new Date(`${planningToday(date)}T00:00:00.000Z`);
}
function money(amount: number, input: EventInput) {
  return new Intl.NumberFormat(input.currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: input.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function allocateBudget(input: EventInput): BudgetItem[] {
  const reserve = Math.round(input.budget / 10);
  const distributable = input.budget - reserve;
  const priorities = input.priorities.join(" ").toLowerCase();
  const weighted = allocations[input.eventType].map((item) => ({
    ...item,
    weight:
      item.weight *
      (item.aliases.some((alias) => priorities.includes(alias)) ? 1.4 : 1),
  }));
  const totalWeight = weighted.reduce((total, item) => total + item.weight, 0);
  const portions = weighted.map(
    (item) => (distributable * item.weight) / totalWeight,
  );
  const whole = portions.map(Math.floor);
  const remaining =
    distributable - whole.reduce((total, value) => total + value, 0);
  const order = portions
    .map((value, index) => ({ index, fraction: value - whole[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let index = 0; index < remaining; index++) whole[order[index].index]++;
  return [
    ...weighted.map((item, index) => ({
      id: item.id,
      category: item.category,
      allocated: whole[index],
      spent: 0,
      color: colors[index],
    })),
    {
      id: "contingency",
      category: "Contingency",
      allocated: reserve,
      spent: 0,
      color: colors[6],
    },
  ];
}

export function buildPlan(
  input: EventInput,
  now: Date = new Date(),
): EventPlan {
  const today = dayStart(now);
  const eventDay = new Date(`${input.date}T00:00:00.000Z`);
  const days = Math.max(
    0,
    Math.round((eventDay.getTime() - today.getTime()) / DAY),
  );
  const budget = allocateBudget(input);
  const tasks: PlanTask[] = taskTemplates[input.eventType].map(
    ([title, daysBefore, category], index) => ({
      id: `task-${input.eventType}-${index + 1}`,
      title,
      dueDate: isoDay(
        new Date(
          Math.max(today.getTime(), eventDay.getTime() - daysBefore * DAY),
        ),
      ),
      category,
      completed: false,
    }),
  );
  const warnings: string[] = [];
  const comfortableLead = input.eventType === "wedding" ? 60 : 21;
  if (days < comfortableLead)
    warnings.push(
      `Your timeline is ${days === 0 ? "today" : `${days} days`}. Confirm the venue, essential suppliers and guest communication first; several tasks may share a deadline.`,
    );
  const perGuestFloor = {
    INR: { wedding: 800, birthday: 250, community: 100 },
    USD: { wedding: 30, birthday: 10, community: 5 },
    EUR: { wedding: 25, birthday: 8, community: 4 },
  }[input.currency][input.eventType];
  if (
    (input.budget - Math.round(input.budget / 10)) / input.guests <
    perGuestFloor
  ) {
    warnings.push(
      `Your planning allowance is ${money(Math.floor(input.budget / input.guests), input)} per guest before contingency. Consider a simpler format, contributed resources or fewer guests. These allocations are planning targets, not supplier quotes.`,
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
  const vendors = allocations[input.eventType].slice(0, 5).map((item) => ({
    id: `vendor-${item.id}`,
    category: item.category,
    name: item.partner,
    status: "To research" as const,
    estimate: budget.find((entry) => entry.id === item.id)!.allocated,
    questions: [
      `Are you available in ${input.city} on ${input.date} for ${input.guests} guests?`,
      "What is included, and which taxes, travel or setup charges are extra?",
      "What are the deposit, cancellation and weather-backup terms?",
    ],
  }));
  const eventLabel =
    input.eventType === "community" ? "community gathering" : input.eventType;
  return {
    id: `event-${globalThis.crypto?.randomUUID?.() ?? `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`}`,
    input: { ...input, priorities: [...input.priorities] },
    summary: `A ${input.style || "thoughtfully planned"} ${eventLabel} in ${input.city} for ${input.guests} guests, with ${money(input.budget, input)} to work with. Start with ${input.priorities.length ? input.priorities.join(", ").toLowerCase() : "the venue, food and guest experience"}; keep a 10% contingency, rounded to the nearest whole currency unit. Supplier amounts are internal planning allowances until you receive real quotes.`,
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
    reply = `Your total budget is ${money(input.budget, input)} for ${input.guests} guests (${money(Math.floor(input.budget / input.guests), input)} each). ${largest ? `${largest.category} is the largest planning allowance at ${money(largest.allocated, input)}. ` : ""}${spent ? `You have recorded ${money(spent, input)} spent. ` : ""}Simplify the format or compare real supplier quotes before reducing guest essentials. Keep the contingency available for surprises.`;
    if (reduction > 0 && reduction < 100 && reduced < input.budget)
      suggestions = [
        { label: `Reduce budget by ${reduction}%`, patch: { budget: reduced } },
      ];
  } else if (/guest|headcount|people|attend|invite|rsvp/i.test(text)) {
    const guests = Math.max(1, Math.floor(input.guests * 0.85));
    reply = `You are planning for ${input.guests} guests in ${input.city}. Keep one RSVP list with dietary and accessibility needs, set a response deadline, and confirm final numbers before catering is locked. At the current budget, the allowance is ${money(Math.floor(input.budget / input.guests), input)} per guest before contingency.`;
    if (guests < input.guests)
      suggestions = [{ label: `Plan for ${guests} guests`, patch: { guests } }];
  } else if (/vendor|supplier|venue|cater|photograph|book|quote/i.test(text)) {
    reply = `Start research with ${plan.vendors
      .slice(0, 3)
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
    reply = `For ${input.title}, I am working with ${input.guests} guests, ${money(input.budget, input)}, ${input.city} and ${input.date}. I can help you weigh the budget, guest count, timeline, supplier requirements or a rain backup. Suggested changes need your Apply action before the plan is regenerated.`;
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
