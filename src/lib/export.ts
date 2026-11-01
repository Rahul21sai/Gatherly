import type { EventPlan } from "./types";
import { money } from "./format";
const escapeCalendar = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r/g, "");
function foldLine(line: string) {
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const count = new TextEncoder().encode(char).length;
    if (bytes + count > 73) {
      parts.push(current);
      current = " ";
      bytes = 1;
    }
    current += char;
    bytes += count;
  }
  parts.push(current);
  return parts.join("\r\n");
}
export function toCalendar(plan: EventPlan) {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const events = plan.tasks
    .filter((task) => !task.completed)
    .flatMap((task) => {
      const end = new Date(task.dueDate + "T12:00:00Z");
      end.setUTCDate(end.getUTCDate() + 1);
      return [
        "BEGIN:VEVENT",
        `UID:${plan.id}-${task.id}@gatherly.local`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${task.dueDate.replaceAll("-", "")}`,
        `DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replaceAll("-", "")}`,
        `SUMMARY:${escapeCalendar(task.title)}`,
        `DESCRIPTION:${escapeCalendar(plan.input.title + " — " + task.category)}`,
        "END:VEVENT",
      ];
    });
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Gatherly//Event Planner//EN",
      "CALSCALE:GREGORIAN",
      ...events,
      "END:VCALENDAR",
    ]
      .map(foldLine)
      .join("\r\n") + "\r\n"
  );
}
export function toPlanMarkdown(plan: EventPlan) {
  const { input } = plan;
  return [
    `# ${input.title}`,
    "",
    `${input.eventType} in ${input.city} on ${input.date}. ${input.guests} guests.`,
    "",
    plan.summary,
    "",
    "## Budget",
    ...plan.budget.map(
      (item) =>
        `- ${item.category}: ${money(item.allocated, input.currency)} planned; ${money(item.spent, input.currency)} spent`,
    ),
    "",
    "## Timeline",
    ...plan.tasks.map(
      (task) =>
        `- [${task.completed ? "x" : " "}] ${task.dueDate}: ${task.title}`,
    ),
    "",
    "## Vendor checklist",
    ...plan.vendors.map(
      (v) => `- ${v.category}: ${v.status}. Ask: ${v.questions.join("; ")}`,
    ),
    "",
    "## Ideas",
    ...plan.ideas.map((i) => `- ${i.title}: ${i.description}`),
    "",
    "## Assumptions",
    "Planning allocations are estimates, not verified vendor quotes. Confirm availability, taxes, deposits, accessibility and cancellation terms directly.",
    `Content source: ${plan.source}.`,
    ...plan.warnings.map((w) => `- ${w}`),
  ].join("\n");
}
export function downloadFile(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
