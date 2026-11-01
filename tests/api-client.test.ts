import { afterEach, describe, expect, it, vi } from "vitest";
import { createEventPlan, askPlanningAssistant } from "../src/lib/api-client";
import { buildPlan } from "../src/lib/planner";
import type { EventInput } from "../src/lib/types";

const input: EventInput = {
  title: "A community lunch",
  eventType: "community",
  city: "Bengaluru",
  date: "2027-02-20",
  guests: 30,
  budget: 50000,
  currency: "INR",
  style: "Garden",
  priorities: [],
  notes: "",
};
afterEach(() => vi.unstubAllGlobals());
describe("browser planning contract", () => {
  it("accepts a validated plan and preserves exact totals", async () => {
    const plan = buildPlan(input);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ plan, mode: "offline" })),
    );
    const result = await createEventPlan(input);
    expect(
      result.plan.budget.reduce((sum, item) => sum + item.allocated, 0),
    ).toBe(input.budget);
    expect(result.mode).toBe("offline");
  });
  it("rejects malformed successful responses before they reach UI state", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ plan: { id: "broken" }, mode: "gemini" }),
        ),
    );
    await expect(createEventPlan(input)).rejects.toThrow(
      "invalid planning response",
    );
  });
  it("keeps error handling safe when an upstream response is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("<html>upstream error</html>", { status: 502 }),
        ),
    );
    await expect(createEventPlan(input)).rejects.toThrow("unreadable response");
  });
  it("rejects unsupported assistant constraint patches", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          reply: "Change the budget",
          mode: "gemini",
          suggestions: [{ label: "Update", patch: { budget: -1 } }],
        }),
      ),
    );
    await expect(
      askPlanningAssistant(input, buildPlan(input), "Update my plan"),
    ).rejects.toThrow("invalid planning response");
  });
});
