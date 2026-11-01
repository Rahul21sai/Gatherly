import type { Currency } from "./types";
import { planningToday } from "./dates";
export function money(
  value: number,
  currency: Currency = "INR",
  compact = false,
) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: compact ? 1 : 0,
    ...(compact ? { notation: "compact" as const } : {}),
  }).format(value);
}
export function dateLabel(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(date + "T12:00:00Z").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    ...options,
  });
}
export function daysTo(date: string) {
  return Math.max(
    0,
    Math.round(
      (Date.parse(date + "T00:00:00Z") -
        Date.parse(planningToday() + "T00:00:00Z")) /
        86400000,
    ),
  );
}
