import type { Currency, EventType } from "../types";

export const CONTINGENCY_DIVISOR = 10;
export const PRIORITY_WEIGHT_MULTIPLIER = 1.4;
export const VENDOR_LEAD_LIMIT = 5;
export const ASSISTANT_VENDOR_LEAD_LIMIT = 3;
export const COMFORTABLE_LEAD_DAYS: Record<EventType, number> = {
  wedding: 60,
  birthday: 21,
  community: 21,
};
export const PER_GUEST_FLOOR: Record<Currency, Record<EventType, number>> = {
  INR: { wedding: 800, birthday: 250, community: 100 },
  USD: { wedding: 30, birthday: 10, community: 5 },
  EUR: { wedding: 25, birthday: 8, community: 4 },
};

export function contingencyAmount(budget: number): number {
  return Math.round(budget / CONTINGENCY_DIVISOR);
}
