import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EventInput, EventPlan, PlanResponse } from "@/lib/types";

const input: EventInput = {
  title: "Garden gathering",
  eventType: "wedding",
  city: "Bengaluru",
  date: "2027-02-20",
  guests: 100,
  budget: 500000,
  currency: "INR",
  style: "Botanical",
  priorities: ["Food", "Photography"],
  notes: "Vegetarian menu and an accessible venue",
};

function request(path: string, body: unknown) {
  return new Request(`http://localhost:3000/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function providerResponse(value: unknown) {
  return new Response(
    JSON.stringify({
      candidates: [
        {
          content: { parts: [{ text: JSON.stringify(value) }] },
          finishReason: "STOP",
        },
      ],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

async function makePlan() {
  const { POST } = await import("@/app/api/plan/route");
  const response = await POST(request("plan", { input }));
  expect(response.status).toBe(200);
  return response.json() as Promise<PlanResponse>;
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("GEMINI_API_KEY", "");
  vi.stubEnv("GEMINI_MODEL", "");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("planning API", () => {
  it("rejects malformed JSON and invalid event constraints", async () => {
    const { POST } = await import("@/app/api/plan/route");
    const malformed = new Request("http://localhost:3000/api/plan", {
      method: "POST",
      body: "{",
    });
    expect((await POST(malformed)).status).toBe(400);
    expect(
      (await POST(request("plan", { input: { ...input, guests: -2 } }))).status,
    ).toBe(400);
    expect((await POST(request("plan", {}))).status).toBe(400);
  });

  it("rejects an oversized request before trying the provider", async () => {
    const { POST } = await import("@/app/api/plan/route");
    const response = await POST(
      request("plan", { input: { ...input, notes: "x".repeat(25000) } }),
    );
    expect(response.status).toBe(413);
  });

  it("works without a provider key and discloses the offline mode", async () => {
    const result = await makePlan();
    expect(result.mode).toBe("offline");
    expect(result.plan.source).toBe("offline");
    expect(result.warning).toMatch(/not configured/i);
    expect(
      result.plan.budget.reduce((sum, item) => sum + item.allocated, 0),
    ).toBe(500000);
    expect(result.plan.tasks.length).toBeGreaterThan(0);
  });

  it("falls back without exposing a provider failure", async () => {
    vi.stubEnv("GEMINI_API_KEY", "private-test-key");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("private-test-key upstream diagnostic", { status: 503 }),
        ),
    );
    const result = await makePlan();
    expect(result.mode).toBe("offline");
    expect(result.warning).toMatch(/unavailable/i);
    expect(JSON.stringify(result)).not.toMatch(/private-test-key|diagnostic/);
    expect(
      result.plan.budget.reduce((sum, item) => sum + item.allocated, 0),
    ).toBe(500000);
  });

  it("rejects malformed AI content and preserves the usable offline plan", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          providerResponse({ summary: "A plan", ideas: "not an array" }),
        ),
    );
    const result = await makePlan();
    expect(result.mode).toBe("offline");
    expect(result.plan.ideas.length).toBeGreaterThan(0);
    expect(result.warning).toMatch(/unavailable/i);
  });

  it("enriches narrative without allowing AI to alter financial values", async () => {
    const baseline = (await makePlan()).plan;
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        providerResponse({
          summary: "A garden wedding with thoughtful vegetarian hospitality.",
          ideas: [
            {
              title: "Herb place cards",
              description: "Use potted herbs as table names and guest favors.",
              tag: "Details",
            },
            {
              title: "Quiet lounge",
              description:
                "Offer a shaded accessible area close to the ceremony.",
              tag: "Guests",
            },
            {
              title: "Seasonal menu",
              description:
                "Ask caterers to propose locally seasonal vegetarian dishes.",
              tag: "Food",
            },
          ],
          budget: [{ id: "food", allocated: 1, spent: 999999999 }],
          guests: 2,
        }),
      ),
    );
    const result = await makePlan();
    expect(result.mode).toBe("gemini");
    expect(result.plan.source).toBe("gemini");
    expect(result.plan.summary).toContain("garden wedding");
    expect(result.plan.budget).toEqual(baseline.budget);
    expect(result.plan.input).toEqual(input);
    expect(result.plan.tasks).toEqual(baseline.tasks);
    expect(result.plan.vendors).toEqual(baseline.vendors);
    expect(result.plan.ideas[0].title).toBe("Herb place cards");
  });

  it("times out a stalled provider and returns the offline plan", async () => {
    const { POST } = await import("@/app/api/plan/route");
    vi.useFakeTimers();
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      ),
    );
    const pending = POST(request("plan", { input }));
    await vi.advanceTimersByTimeAsync(21000);
    const result = await (await pending).json();
    expect(result.mode).toBe("offline");
    expect(result.warning).toMatch(/unavailable/i);
  });

  it("bounds live AI calls and keeps serving offline plans after the limit", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 })),
    );
    const { POST } = await import("@/app/api/plan/route");
    let last: PlanResponse | undefined;
    for (let index = 0; index < 13; index += 1) {
      last = await (await POST(request("plan", { input }))).json();
    }
    expect(last?.mode).toBe("offline");
    expect(last?.warning).toMatch(/limit|busy/i);
    expect(
      last?.plan.budget.reduce((sum, item) => sum + item.allocated, 0),
    ).toBe(500000);
  });
});

describe("assistant API", () => {
  it("validates messages and plan context", async () => {
    const plan = (await makePlan()).plan;
    const { POST } = await import("@/app/api/assistant/route");
    expect(
      (await POST(request("assistant", { input, plan, message: " " }))).status,
    ).toBe(400);
    expect(
      (
        await POST(
          request("assistant", {
            input,
            plan: {},
            message: "Can I reduce the budget?",
          }),
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await POST(
          request("assistant", { input, plan, message: "x".repeat(2001) }),
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await POST(
          request("assistant", {
            input,
            plan: { ...plan, summary: "x".repeat(33000) },
            message: "Help",
          }),
        )
      ).status,
    ).toBe(413);
  });

  it("gives offline advice with only validated deterministic suggestions", async () => {
    const plan = (await makePlan()).plan;
    const { POST } = await import("@/app/api/assistant/route");
    const response = await POST(
      request("assistant", {
        input,
        plan,
        message: "Can I reduce the budget?",
      }),
    );
    const result = await response.json();
    expect(result.mode).toBe("offline");
    expect(result.reply.length).toBeGreaterThan(10);
    expect(result.warning).toMatch(/not configured/i);
    expect(Array.isArray(result.suggestions)).toBe(true);
    for (const suggestion of result.suggestions) {
      expect(suggestion.label.length).toBeGreaterThan(0);
      expect(suggestion.patch).not.toHaveProperty("spent");
    }
  });

  it("ignores tampered allocation and event input while preserving tracked spend", async () => {
    const original = (await makePlan()).plan;
    const plan: EventPlan = {
      ...original,
      input: { ...input, budget: 100 },
      budget: original.budget.map((item, index) => ({
        ...item,
        allocated: 1,
        spent: index === 0 ? 1234 : 0,
      })),
    };
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    let captured: Record<string, unknown> | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        captured = JSON.parse(String(init.body));
        return providerResponse({
          reply: "Keep the protected guest experience in view.",
          suggestions: [{ patch: { budget: 1 } }],
        });
      }),
    );
    const { POST } = await import("@/app/api/assistant/route");
    const response = await POST(
      request("assistant", {
        input,
        plan,
        message: "What is my current budget?",
      }),
    );
    const result = await response.json();
    expect(result.mode).toBe("gemini");
    const prompt = JSON.stringify(captured);
    expect(prompt).toContain('\\"budget\\":500000');
    expect(prompt).toContain('\\"spent\\":1234');
    expect(prompt).not.toContain('\\"allocated\\":1,');
    expect(result.suggestions).not.toContainEqual({ patch: { budget: 1 } });
  });

  it("rejects negative tracked spend before contacting Gemini", async () => {
    const plan = (await makePlan()).plan;
    plan.budget[0].spent = -1;
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    const { POST } = await import("@/app/api/assistant/route");
    const response = await POST(
      request("assistant", { input, plan, message: "How much is left?" }),
    );
    expect(response.status).toBe(400);
  });
});
