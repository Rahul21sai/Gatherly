import { z } from "zod";
import { buildPlan } from "@/lib/planner";
import { inputSchema } from "@/lib/validation";
import type { EventInput, EventPlan } from "@/lib/types";
import { errorResponse, jsonByteSize, type ValidationResult } from "./http";

const PLAN_CONTEXT_LIMIT = 32000;
const boundedText = z.string().max(1000);
const identifier = z.string().min(1).max(100);
const money = z.number().finite().min(0).max(1000000000);
const planSchema = z.object({
  id: identifier,
  input: inputSchema,
  summary: z.string().max(2000),
  budget: z
    .array(
      z.object({
        id: identifier,
        category: z.string().max(100),
        allocated: money,
        spent: money,
        color: z.string().max(50),
      }),
    )
    .min(1)
    .max(20),
  tasks: z
    .array(
      z.object({
        id: identifier,
        title: z.string().max(250),
        dueDate: z.string().max(40),
        category: z.string().max(100),
        completed: z.boolean(),
      }),
    )
    .max(100),
  vendors: z
    .array(
      z.object({
        id: identifier,
        category: z.string().max(100),
        name: z.string().max(200),
        status: z.enum(["To research", "Shortlisted", "Booked"]),
        estimate: money,
        questions: z.array(boundedText).max(10),
      }),
    )
    .max(30),
  ideas: z
    .array(
      z.object({
        id: identifier,
        title: z.string().max(150),
        description: boundedText,
        tag: z.string().max(100),
        color: z.string().max(50),
        saved: z.boolean(),
      }),
    )
    .max(30),
  warnings: z.array(boundedText).max(30),
  source: z.enum(["offline", "gemini"]),
  generatedAt: z.string().max(50),
});

export function validatedAssistantContext(
  value: unknown,
  input: EventInput,
): ValidationResult<{ plan: EventPlan }> {
  if (jsonByteSize(value) > PLAN_CONTEXT_LIMIT)
    return {
      ok: false,
      response: errorResponse("The plan context is too large.", 413),
    };
  const parsed = planSchema.safeParse(value);
  if (!parsed.success)
    return {
      ok: false,
      response: errorResponse(
        "The saved plan is invalid. Generate a new plan and try again.",
      ),
    };
  const original = parsed.data;
  const baseline = buildPlan(input);
  const knownBudgetIds = new Set(baseline.budget.map((item) => item.id));
  const suppliedIds = original.budget.map((item) => item.id);
  if (
    new Set(suppliedIds).size !== suppliedIds.length ||
    suppliedIds.some((id) => !knownBudgetIds.has(id))
  ) {
    return {
      ok: false,
      response: errorResponse(
        "The saved budget is invalid. Generate a new plan and try again.",
      ),
    };
  }
  const spend = new Map(original.budget.map((item) => [item.id, item.spent]));
  const completed = new Map(
    original.tasks.map((task) => [task.id, task.completed]),
  );
  const status = new Map(
    original.vendors.map((vendor) => [vendor.id, vendor.status]),
  );
  const plan: EventPlan = {
    ...baseline,
    budget: baseline.budget.map((item) => ({
      ...item,
      spent: spend.get(item.id) ?? 0,
    })),
    tasks: baseline.tasks.map((task) => ({
      ...task,
      completed: completed.get(task.id) ?? false,
    })),
    vendors: baseline.vendors.map((vendor) => ({
      ...vendor,
      status: status.get(vendor.id) ?? vendor.status,
    })),
  };
  return { ok: true, plan };
}
