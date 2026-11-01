import type { EventPlan } from "@/lib/types";

export type Tab =
  "Overview" | "Budget" | "Timeline" | "Vendors" | "Inspiration";
export type UpdatePlan = (plan: EventPlan) => void;

export interface PlanProps {
  plan: EventPlan;
}

export interface EditablePlanProps extends PlanProps {
  onUpdate: UpdatePlan;
}

export interface OverviewProps extends EditablePlanProps {
  onTab: (tab: Tab) => void;
}

export interface TaskRowProps extends EditablePlanProps {
  task: EventPlan["tasks"][number];
}
