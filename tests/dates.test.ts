import { describe, expect, it, vi, afterEach } from "vitest";
import { buildPlan } from "../src/lib/planner";
import { inputSchema } from "../src/lib/validation";
import { daysTo } from "../src/lib/format";
import type { EventInput } from "../src/lib/types";
afterEach(() => vi.useRealTimers());
describe("consistent India planning dates", () => {
  it("clamps deadlines to the current India date after local midnight", () => {
    const now = new Date("2026-11-01T20:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const input: EventInput = {
      title: "Today’s gathering",
      eventType: "community",
      city: "Bengaluru",
      date: "2026-11-02",
      guests: 20,
      budget: 10000,
      currency: "INR",
      style: "Indoor",
      priorities: [],
      notes: "",
    };
    expect(inputSchema.safeParse(input).success).toBe(true);
    expect(
      inputSchema.safeParse({ ...input, date: "2026-11-01" }).success,
    ).toBe(false);
    expect(
      buildPlan(input, now).tasks.every(
        (task) => task.dueDate === "2026-11-02",
      ),
    ).toBe(true);
    expect(daysTo("2026-11-02")).toBe(0);
  });
});
