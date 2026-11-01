import { z } from "zod";
import { isCalendarDate, planningToday } from "./dates";

function isPlanningDate(value: string) {
  if (!isCalendarDate(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    return false;
  const today = new Date(`${planningToday()}T00:00:00.000Z`);
  const latest = new Date(today);
  latest.setUTCFullYear(latest.getUTCFullYear() + 5);
  return date >= today && date <= latest;
}

export const inputSchema = z
  .object({
    title: z.string().trim().min(1, "Give your event a name.").max(120),
    eventType: z.enum(["wedding", "birthday", "community"]),
    city: z.string().trim().min(1, "Enter a city.").max(100),
    date: z
      .string()
      .refine(
        isPlanningDate,
        "Choose a real date from today through the next five years.",
      ),
    guests: z.number().int().min(1).max(10_000),
    budget: z.number().int().min(100).max(100_000_000),
    currency: z.enum(["INR", "USD", "EUR"]),
    style: z.string().trim().max(160),
    priorities: z.array(z.string().trim().min(1).max(40)).max(6),
    notes: z.string().trim().max(2_000),
  })
  .strict();
