import { useState } from "react";
import { CircleCheck, Clock3, Download, ListChecks } from "lucide-react";
import { downloadFile, toCalendar } from "@/lib/export";
import { TaskRow } from "./shared";
import type { EditablePlanProps } from "./props";

export function TimelinePanel({ plan, onUpdate }: EditablePlanProps) {
  const [filter, setFilter] = useState("All tasks");
  const tasks = plan.tasks.filter(
    (task) =>
      filter === "All tasks" ||
      (filter === "To do" ? !task.completed : task.completed),
  );
  return (
    <div className="tab-content">
      <div className="section-title">
        <span className="soft-icon">
          <ListChecks size={23} />
        </span>
        <div>
          <h2>One little step at a time.</h2>
          <p>From the first idea to the final happy memory.</p>
        </div>
      </div>
      <div className="tab-toolbar">
        <div className="segmented">
          {["All tasks", "To do", "Completed"].map((taskFilter) => (
            <button
              key={taskFilter}
              aria-pressed={taskFilter === filter}
              className={taskFilter === filter ? "active" : ""}
              onClick={() => setFilter(taskFilter)}
            >
              {taskFilter}
            </button>
          ))}
        </div>
        <button
          className="button secondary"
          onClick={() =>
            downloadFile(
              toCalendar(plan),
              "gatherly-timeline.ics",
              "text/calendar",
            )
          }
        >
          <Download size={16} />
          Export calendar
        </button>
      </div>
      <section className="panel timeline-list">
        {tasks.length ? (
          tasks.map((task, index) => (
            <div className="timeline-entry" key={task.id}>
              <div className="timeline-marker">
                <span>{index + 1}</span>
              </div>
              <TaskRow plan={plan} task={task} onUpdate={onUpdate} />
            </div>
          ))
        ) : (
          <div className="empty-state">
            <CircleCheck size={30} />
            <h3>
              {filter === "Completed"
                ? "Your first small win is waiting."
                : "All caught up."}
            </h3>
            <p>
              {filter === "Completed"
                ? "Tick off a task to see it here."
                : "Make a little room to celebrate."}
            </p>
          </div>
        )}
      </section>
      <div className="subtle-tip">
        <Clock3 size={17} />
        <p>
          Dates adapt to your lead time. Confirm time-sensitive bookings
          directly with your vendors.
        </p>
      </div>
    </div>
  );
}
