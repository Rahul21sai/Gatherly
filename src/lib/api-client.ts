import { z } from "zod";
import { eventPlanSchema } from "./storage";
import { inputSchema } from "./validation";
import type {
  AssistantResponse,
  EventInput,
  EventPlan,
  PlanResponse,
} from "./types";

const REQUEST_TIMEOUT_MS = 30_000;
const modeSchema = z.enum(["offline", "gemini"]);
const errorSchema = z.object({ error: z.string().min(1).max(1000) });
const planResponseSchema = z.object({
  plan: eventPlanSchema,
  mode: modeSchema,
  warning: z.string().max(1000).optional(),
});
const assistantResponseSchema = z.object({
  reply: z.string().min(1).max(5000),
  mode: modeSchema,
  warning: z.string().max(1000).optional(),
  suggestions: z
    .array(
      z.object({
        label: z.string().min(1).max(200),
        patch: inputSchema.partial(),
      }),
    )
    .max(10),
});

async function postJson<T>(
  path: string,
  payload: unknown,
  schema: z.ZodType<T>,
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(
      "The server returned an unreadable response. Please try again.",
    );
  }
  if (!response.ok) {
    const error = errorSchema.safeParse(body);
    throw new Error(
      error.success
        ? error.data.error
        : "The request could not be completed. Please try again.",
    );
  }
  const result = schema.safeParse(body);
  if (!result.success)
    throw new Error(
      "The server returned an invalid planning response. Please try again.",
    );
  return result.data;
}

export function createEventPlan(input: EventInput): Promise<PlanResponse> {
  return postJson("/api/plan", { input }, planResponseSchema);
}

export function askPlanningAssistant(
  input: EventInput,
  plan: EventPlan,
  message: string,
): Promise<AssistantResponse> {
  return postJson(
    "/api/assistant",
    { input, plan, message },
    assistantResponseSchema,
  );
}
