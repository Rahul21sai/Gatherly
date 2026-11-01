import {
  CalendarDays,
  Check,
  CircleCheck,
  UsersRound,
  Wallet,
} from "lucide-react";
import { dateLabel, daysTo, money } from "@/lib/format";
import type { PlanProps, TaskRowProps } from "./props";

export function Metrics({ plan }: PlanProps) {
  const complete = plan.tasks.filter((task) => task.completed).length;
  return (
    <div className="metrics">
      {[
        {
          icon: Wallet,
          label: "Your total budget",
          value: money(plan.input.budget, plan.input.currency),
          detail: `${money(Math.round(plan.input.budget / plan.input.guests), plan.input.currency)} per guest`,
          tone: "violet",
        },
        {
          icon: UsersRound,
          label: "People to celebrate with",
          value: plan.input.guests.toLocaleString("en-IN"),
          detail: "A place for everyone",
          tone: "peach",
        },
        {
          icon: CircleCheck,
          label: "Little things, done",
          value: `${complete} / ${plan.tasks.length}`,
          detail: complete
            ? "Look at you making progress"
            : "One step at a time",
          tone: "sage",
        },
        {
          icon: CalendarDays,
          label: "Until the big day",
          value: `${daysTo(plan.input.date)}`,
          detail: dateLabel(plan.input.date),
          tone: "rose",
        },
      ].map(({ icon: Icon, label, value, detail, tone }) => (
        <div className="metric" key={label}>
          <div className={`metric-icon ${tone}`}>
            <Icon size={19} />
          </div>
          <div>
            <span className="metric-label">{label}</span>
            <strong>
              {value}
              <span>{label === "Until the big day" ? " days" : ""}</span>
            </strong>
            <small>{detail}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BudgetDonut({ plan }: PlanProps) {
  const gradient = plan.budget.reduce(
    (current, item) => {
      const end = current.end + (item.allocated / plan.input.budget) * 100;
      return {
        end,
        segments: [
          ...current.segments,
          `${item.color} ${current.end}% ${end}%`,
        ],
      };
    },
    { end: 0, segments: [] as string[] },
  );
  const segments = gradient.segments.join(",");
  return (
    <div className="budget-visual">
      <div
        className="donut"
        style={{ background: `conic-gradient(${segments})` }}
        role="img"
        aria-label={`Budget allocations total ${money(plan.input.budget, plan.input.currency)}`}
      >
        <div className="donut-center">
          <Wallet size={20} />
          <strong>{money(plan.input.budget, plan.input.currency, true)}</strong>
          <span>planned with purpose</span>
        </div>
      </div>
      <div className="budget-legend">
        {plan.budget.map((budgetItem) => (
          <div key={budgetItem.id}>
            <span>
              <i style={{ background: budgetItem.color }} />
              {budgetItem.category}
            </span>
            <strong>{money(budgetItem.allocated, plan.input.currency)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskRow({ plan, task, onUpdate }: TaskRowProps) {
  return (
    <label className={`task-row ${task.completed ? "complete" : ""}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() =>
          onUpdate({
            ...plan,
            tasks: plan.tasks.map((existingTask) =>
              existingTask.id === task.id
                ? { ...existingTask, completed: !existingTask.completed }
                : existingTask,
            ),
          })
        }
      />
      <span className="custom-checkbox">
        <Check size={13} />
      </span>
      <span className="task-body">
        <strong>{task.title}</strong>
        <small>{task.category}</small>
      </span>
      <span className="task-date">
        {dateLabel(task.dueDate, { year: undefined })}
      </span>
    </label>
  );
}
