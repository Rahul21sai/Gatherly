import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildPlan, offlineAssistant } from "../src/lib/planner";
import { inputSchema } from "../src/lib/validation";
import type { EventInput } from "../src/lib/types";

const now = new Date("2026-11-01T12:00:00.000Z");
const input: EventInput = {
  title: "An evening together",
  eventType: "wedding",
  city: "Bengaluru",
  date: "2027-02-20",
  guests: 120,
  budget: 500_000,
  currency: "INR",
  style: "Intimate garden celebration",
  priorities: [],
  notes: "Vegetarian food and a relaxed evening",
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});
afterEach(() => vi.useRealTimers());

describe("planning finances", () => {
  it.each([
    ["wedding", 100, 10],
    ["birthday", 101, 10],
    ["community", 9_999, 1_000],
    ["wedding", 500_000, 50_000],
  ] as const)(
    "keeps every %s budget unit accounted for at %i",
    (eventType, budget, reserve) => {
      const plan = buildPlan({ ...input, eventType, budget }, now);
      expect(
        plan.budget.reduce((total, item) => total + item.allocated, 0),
      ).toBe(budget);
      expect(
        plan.budget.find((item) => item.id === "contingency")?.allocated,
      ).toBe(reserve);
      expect(
        plan.budget.every(
          (item) =>
            Number.isInteger(item.allocated) &&
            item.allocated >= 0 &&
            item.spent === 0,
        ),
      ).toBe(true);
    },
  );

  it("increases food allocation when food is a stated priority without spending the reserve", () => {
    const baseline = buildPlan(input, now);
    const prioritized = buildPlan(
      { ...input, priorities: ["Food & drinks"] },
      now,
    );
    expect(
      prioritized.budget.find((item) => item.id === "food")!.allocated,
    ).toBeGreaterThan(
      baseline.budget.find((item) => item.id === "food")!.allocated,
    );
    expect(
      prioritized.budget.find((item) => item.id === "contingency")!.allocated,
    ).toBe(50_000);
  });

  it("offers generic research leads with estimates, never fictitious bookings", () => {
    const plan = buildPlan(input, now);
    expect(plan.vendors.length).toBeGreaterThan(0);
    expect(
      plan.vendors.every(
        (vendor) =>
          vendor.status === "To research" &&
          vendor.name.endsWith("partner") &&
          Number.isInteger(vendor.estimate),
      ),
    ).toBe(true);
    expect(plan.source).toBe("offline");
  });
});

describe("dates and feasibility", () => {
  it.each(["2026-11-01", "2026-11-03", "2028-02-29", "2031-11-01"])(
    "keeps deadlines within the planning window for %s",
    (date) => {
      const plan = buildPlan({ ...input, date }, now);
      expect(plan.tasks.length).toBeGreaterThan(3);
      for (const task of plan.tasks) {
        expect(task.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(task.dueDate >= "2026-11-01" && task.dueDate <= date).toBe(true);
      }
    },
  );

  it("warns when the timeline, per-person budget, and outdoor contingency need attention", () => {
    const plan = buildPlan(
      { ...input, date: "2026-11-03", budget: 1_000 },
      now,
    );
    expect(plan.warnings.join(" ")).toMatch(/timeline|days|soon/i);
    expect(plan.warnings.join(" ")).toMatch(/budget|per guest/i);
    expect(plan.warnings.join(" ")).toMatch(/rain|indoor|weather/i);
  });

  it("changes the actual task content for each event type", () => {
    const wedding = buildPlan(input, now);
    const birthday = buildPlan({ ...input, eventType: "birthday" }, now);
    const community = buildPlan({ ...input, eventType: "community" }, now);
    expect(wedding.tasks.map((task) => task.title).join(" ")).toMatch(
      /ceremony/i,
    );
    expect(birthday.tasks.map((task) => task.title).join(" ")).toMatch(/cake/i);
    expect(community.tasks.map((task) => task.title).join(" ")).toMatch(
      /permit|volunteer/i,
    );
    expect(
      new Set([
        wedding.ideas[0].title,
        birthday.ideas[0].title,
        community.ideas[0].title,
      ]).size,
    ).toBe(3);
  });
});

describe("event input boundary", () => {
  it("accepts today and leap day but rejects impossible, past, and distant dates", () => {
    expect(
      inputSchema.safeParse({ ...input, date: "2026-11-01" }).success,
    ).toBe(true);
    expect(
      inputSchema.safeParse({ ...input, date: "2028-02-29" }).success,
    ).toBe(true);
    for (const date of [
      "2026-10-31",
      "2027-02-29",
      "2027-02-30",
      "2031-11-02",
      "2027-2-20",
      "not-a-date",
    ]) {
      expect(inputSchema.safeParse({ ...input, date }).success, date).toBe(
        false,
      );
    }
  });

  it.each([
    { title: " " },
    { title: "a".repeat(121) },
    { city: "a".repeat(101) },
    { guests: 0 },
    { guests: 1.5 },
    { guests: 10_001 },
    { budget: 99 },
    { budget: 100.5 },
    { budget: 100_000_001 },
    { budget: Infinity },
    { currency: "GBP" },
    { eventType: "conference" },
    { style: "a".repeat(161) },
    { notes: "a".repeat(2_001) },
    { priorities: Array(7).fill("Food") },
  ])("rejects malformed or unbounded fields: %j", (patch) => {
    expect(inputSchema.safeParse({ ...input, ...patch }).success).toBe(false);
  });
});

describe("offline planning assistant", () => {
  it("proposes a requested 15% budget reduction without mutating the event", () => {
    const plan = buildPlan(input, now);
    const response = offlineAssistant(input, plan, "Reduce budget by 15%");
    expect(response.mode).toBe("offline");
    expect(
      response.suggestions.some(
        (suggestion) => suggestion.patch.budget === 425_000,
      ),
    ).toBe(true);
    expect(input.budget).toBe(500_000);
    expect(plan.input.budget).toBe(500_000);
  });

  it("adds a concrete rain-backup note only through an explicit suggestion", () => {
    const plan = buildPlan(input, now);
    const response = offlineAssistant(input, plan, "Add a rain backup");
    expect(response.reply).toMatch(/rain|indoor/i);
    const suggestion = response.suggestions.find(
      (item) => item.label === "Add a rain backup",
    );
    expect(suggestion?.patch.notes).toMatch(/indoor|covered/i);
    expect(suggestion?.patch.notes).toContain(input.notes);
    expect(
      inputSchema.safeParse({ ...input, ...suggestion?.patch }).success,
    ).toBe(true);
  });

  it.each([
    ["How should I manage the guest list?", /120|guest/i],
    ["What should happen next on the timeline?", /2027-02-20|deadline|task/i],
    ["Which vendors do I need?", /research|quote|partner/i],
  ])("uses this event to answer %s", (message, expected) => {
    const response = offlineAssistant(input, buildPlan(input, now), message);
    expect(response.reply).toMatch(expected);
    for (const suggestion of response.suggestions) {
      expect(
        inputSchema.safeParse({ ...input, ...suggestion.patch }).success,
      ).toBe(true);
    }
  });
});
