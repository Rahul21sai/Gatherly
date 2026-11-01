import Workspace from "@/components/workspace";
import { buildPlan } from "@/lib/planner";
import type { EventInput } from "@/lib/types";
import { planningToday } from "@/lib/dates";
export const dynamic = "force-dynamic";
export default function Page() {
  const future = new Date(planningToday() + "T12:00:00Z");
  future.setUTCDate(future.getUTCDate() + 42);
  const input: EventInput = {
    title: "Meera & Arjun’s wedding",
    eventType: "wedding",
    city: "Bengaluru",
    date: future.toISOString().slice(0, 10),
    guests: 120,
    budget: 850000,
    currency: "INR",
    style: "Intimate garden celebration",
    priorities: ["Food", "Decor"],
    notes:
      "Vegetarian menu, step-free venue access, and a rain backup for an outdoor ceremony.",
  };
  return (
    <Workspace initialPlan={{ ...buildPlan(input), id: "gatherly-sample" }} />
  );
}
