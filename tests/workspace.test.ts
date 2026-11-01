import { describe, expect, it } from "vitest";
import { parseWorkspace } from "../src/lib/storage";
import { toCalendar, toPlanMarkdown } from "../src/lib/export";
import type { EventPlan } from "../src/lib/types";
import { money } from "../src/lib/format";
import { buildPlan } from "../src/lib/planner";

const plan: EventPlan = {
  id: "example",
  input: {
    title: "A party, together",
    eventType: "birthday",
    city: "Bengaluru",
    date: "2027-01-01",
    guests: 20,
    budget: 20000,
    currency: "INR",
    style: "Garden",
    priorities: [],
    notes: "",
  },
  summary: "A celebration",
  budget: [
    {
      id: "food",
      category: "Food",
      allocated: 20000,
      spent: 500,
      color: "#7761C9",
    },
  ],
  tasks: [
    {
      id: "1",
      title: "Confirm venue, and catering; ask\nquestions",
      dueDate: "2026-12-01",
      category: "Venue",
      completed: false,
    },
  ],
  vendors: [],
  ideas: [],
  warnings: [],
  source: "offline",
  generatedAt: "2026-11-01T00:00:00Z",
};
describe("saved workspace", () => {
  it.each(["wedding", "birthday", "community"] as const)(
    "restores a generated %s plan with tracked spending",
    (eventType) => {
      const generated = buildPlan({ ...plan.input, eventType });
      generated.budget[0].spent = 1200;
      const restored = parseWorkspace(JSON.stringify([generated]));
      expect(restored).toHaveLength(1);
      expect(restored[0].budget[0].spent).toBe(1200);
    },
  );
  it("recovers safely from corrupt or structurally invalid browser storage", () => {
    expect(parseWorkspace("{broken")).toEqual([]);
    expect(parseWorkspace(JSON.stringify([{ id: "bad", input: {} }]))).toEqual(
      [],
    );
    expect(parseWorkspace(null)).toEqual([]);
    expect(
      parseWorkspace(
        JSON.stringify([
          { ...plan, budget: [{ ...plan.budget[0], spent: -1 }] },
        ]),
      ),
    ).toEqual([]);
    expect(
      parseWorkspace(
        JSON.stringify([
          { ...plan, input: { ...plan.input, date: "2027-99-99" } },
        ]),
      ),
    ).toEqual([]);
    expect(
      parseWorkspace(
        JSON.stringify([
          { ...plan, tasks: [{ ...plan.tasks[0], dueDate: "invalid" }] },
        ]),
      ),
    ).toEqual([]);
  });
  it("retains real tracked progress and limits saved events", () => {
    const recovered = parseWorkspace(JSON.stringify([plan]));
    expect(recovered[0].budget[0].spent).toBe(500);
    expect(recovered[0].tasks[0].completed).toBe(false);
    expect(
      parseWorkspace(
        JSON.stringify(
          Array.from({ length: 30 }, (_, i) => ({ ...plan, id: String(i) })),
        ),
      ),
    ).toHaveLength(20);
  });
});
describe("portable event exports", () => {
  it("keeps a meaningful decimal in compact budget labels", () => {
    expect(money(850000, "INR", true)).toBe("₹8.5L");
  });
  it("exports all-day tasks with escaped calendar text and CRLF lines", () => {
    const calendar = toCalendar(plan);
    expect(calendar).toContain("BEGIN:VCALENDAR\r\n");
    expect(calendar).toContain("DTSTART;VALUE=DATE:20261201");
    expect(calendar).toContain(
      "SUMMARY:Confirm venue\\, and catering\\; ask\\nquestions",
    );
    expect(calendar).toContain("DTEND;VALUE=DATE:20261202");
    expect(calendar).toContain("UID:example-1@gatherly.local");
  });
  it("includes budget, tasks, and honest estimate assumptions in the printable brief", () => {
    const brief = toPlanMarkdown(plan);
    expect(brief).toContain("A party, together");
    expect(brief).toContain("20,000");
    expect(brief).toContain("Confirm venue");
    expect(brief).toContain("estimates");
  });
});
