export type EventType = "wedding" | "birthday" | "community";
export type Currency = "INR" | "USD" | "EUR";
export interface EventInput {
  title: string;
  eventType: EventType;
  city: string;
  date: string;
  guests: number;
  budget: number;
  currency: Currency;
  style: string;
  priorities: string[];
  notes: string;
}
export interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  color: string;
}
export interface PlanTask {
  id: string;
  title: string;
  dueDate: string;
  category: string;
  completed: boolean;
}
export interface Vendor {
  id: string;
  category: string;
  name: string;
  status: "To research" | "Shortlisted" | "Booked";
  estimate: number;
  questions: string[];
}
export interface Idea {
  id: string;
  title: string;
  description: string;
  tag: string;
  color: string;
  saved: boolean;
}
export interface EventPlan {
  id: string;
  input: EventInput;
  summary: string;
  budget: BudgetItem[];
  tasks: PlanTask[];
  vendors: Vendor[];
  ideas: Idea[];
  warnings: string[];
  source: "offline" | "gemini";
  generatedAt: string;
}
export interface PlanResponse {
  plan: EventPlan;
  mode: "offline" | "gemini";
  warning?: string;
}
export interface Suggestion {
  label: string;
  patch: Partial<EventInput>;
}
export interface AssistantResponse {
  reply: string;
  suggestions: Suggestion[];
  mode: "offline" | "gemini";
  warning?: string;
}
