import { z } from "zod";
import type { EventPlan } from "./types";
import { isCalendarDate } from "./dates";

export const STORAGE_KEY = "gatherly-workspace-v1";
const text = z.string().max(3000);
const amount = z.number().finite().min(0).max(1e9);
const date = z.string().refine(isCalendarDate);
const color = z.string().regex(/^#[\da-f]{6}$/i);
const input = z.object({
  title: text,
  eventType: z.enum(["wedding", "birthday", "community"]),
  city: text,
  date,
  guests: z.number().int().min(1).max(10000),
  budget: amount,
  currency: z.enum(["INR", "USD", "EUR"]),
  style: text,
  priorities: z.array(text).max(6),
  notes: text,
});
const savedPlan = z.object({
  id: text,
  input,
  summary: text,
  budget: z
    .array(
      z.object({
        id: text,
        category: text,
        allocated: amount,
        spent: amount,
        color,
      }),
    )
    .max(30),
  tasks: z
    .array(
      z.object({
        id: text,
        title: text,
        dueDate: date,
        category: text,
        completed: z.boolean(),
      }),
    )
    .max(100),
  vendors: z
    .array(
      z.object({
        id: text,
        category: text,
        name: text,
        status: z.enum(["To research", "Shortlisted", "Booked"]),
        estimate: amount,
        questions: z.array(text).max(15),
      }),
    )
    .max(30),
  ideas: z
    .array(
      z.object({
        id: text,
        title: text,
        description: text,
        tag: text,
        color,
        saved: z.boolean(),
      }),
    )
    .max(30),
  warnings: z.array(text).max(30),
  source: z.enum(["offline", "gemini"]),
  generatedAt: text,
});

export function parseWorkspace(value: string | null): EventPlan[] {
  if (!value || value.length > 2_000_000) return [];
  try {
    const data: unknown = JSON.parse(value);
    if (!Array.isArray(data)) return [];
    return data.slice(0, 20).flatMap((item) => {
      const parsed = savedPlan.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    });
  } catch {
    return [];
  }
}
