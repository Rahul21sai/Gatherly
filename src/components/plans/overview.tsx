import Image from "next/image";
import { ArrowUpRight, CircleCheck, ShieldCheck } from "lucide-react";
import { BudgetDonut, TaskRow } from "./shared";
import type { OverviewProps } from "./props";

export function Overview({ plan, onUpdate, onTab }: OverviewProps) {
  const completed = plan.tasks.filter((task) => task.completed).length;
  const upcoming = plan.tasks.filter((task) => !task.completed).slice(0, 4);
  return (
    <div className="overview-content">
      <section className="panel budget-overview">
        <div className="panel-heading">
          <div>
            <h2>A budget that makes sense</h2>
            <p>A little structure. More room to celebrate.</p>
          </div>
          <button className="text-button" onClick={() => onTab("Budget")}>
            View budget
            <ArrowUpRight size={15} />
          </button>
        </div>
        <BudgetDonut plan={plan} />
        <div className="panel-note">
          <ShieldCheck size={15} />
          <span>Your contingency is already tucked away.</span>
        </div>
      </section>
      <section className="panel next-up">
        <div className="panel-heading">
          <div>
            <h2>Your next little steps</h2>
            <p>
              {completed} of {plan.tasks.length} things taken care of
            </p>
          </div>
          <button className="text-button" onClick={() => onTab("Timeline")}>
            View all
            <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="task-progress">
          <span
            style={{
              width: `${(completed / Math.max(1, plan.tasks.length)) * 100}%`,
            }}
          />
        </div>
        <div>
          {upcoming.length ? (
            upcoming.map((task) => (
              <TaskRow
                key={task.id}
                plan={plan}
                task={task}
                onUpdate={onUpdate}
              />
            ))
          ) : (
            <div className="empty-state">
              <CircleCheck size={30} />
              <h3>You’ve taken care of everything.</h3>
              <p>Time to enjoy your moment.</p>
            </div>
          )}
        </div>
      </section>
      <section className="inspiration-preview">
        <div className="panel-heading">
          <div>
            <h2>A little inspiration</h2>
            <p>Details that feel a little more like you.</p>
          </div>
          <button className="text-button" onClick={() => onTab("Inspiration")}>
            Explore ideas
            <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="preview-cards">
          {plan.ideas.slice(0, 2).map((idea, index) => (
            <button
              key={idea.id}
              className="preview-card"
              onClick={() => onTab("Inspiration")}
            >
              <Image
                src={index === 0 ? "/images/table.jpg" : "/images/party.jpg"}
                alt=""
                width={300}
                height={160}
              />
              <span>
                <small>{idea.tag}</small>
                <strong>{idea.title}</strong>
                <ArrowUpRight size={17} />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
