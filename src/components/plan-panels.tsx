"use client";
import { useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Check,
  CircleCheck,
  Download,
  Heart,
  Lightbulb,
  ListChecks,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  Wallet,
  UsersRound,
  CalendarDays,
  Clock3,
} from "lucide-react";
import type { EventPlan, Vendor } from "@/lib/types";
import { money, dateLabel, daysTo } from "@/lib/format";
import { downloadFile, toCalendar } from "@/lib/export";
export type Tab =
  "Overview" | "Budget" | "Timeline" | "Vendors" | "Inspiration";
export type UpdatePlan = (plan: EventPlan) => void;

export function Metrics({ plan }: { plan: EventPlan }) {
  const complete = plan.tasks.filter((t) => t.completed).length;
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

export function BudgetDonut({ plan }: { plan: EventPlan }) {
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
        {plan.budget.map((b) => (
          <div key={b.id}>
            <span>
              <i style={{ background: b.color }} />
              {b.category}
            </span>
            <strong>{money(b.allocated, plan.input.currency)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskRow({
  plan,
  task,
  onUpdate,
}: {
  plan: EventPlan;
  task: EventPlan["tasks"][number];
  onUpdate: UpdatePlan;
}) {
  return (
    <label className={`task-row ${task.completed ? "complete" : ""}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() =>
          onUpdate({
            ...plan,
            tasks: plan.tasks.map((t) =>
              t.id === task.id ? { ...t, completed: !t.completed } : t,
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

export function Overview({
  plan,
  onUpdate,
  onTab,
}: {
  plan: EventPlan;
  onUpdate: UpdatePlan;
  onTab: (tab: Tab) => void;
}) {
  const completed = plan.tasks.filter((t) => t.completed).length;
  const upcoming = plan.tasks.filter((t) => !t.completed).slice(0, 4);
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

export function BudgetPanel({
  plan,
  onUpdate,
}: {
  plan: EventPlan;
  onUpdate: UpdatePlan;
}) {
  const spent = plan.budget.reduce((s, b) => s + b.spent, 0);
  const remaining = plan.input.budget - spent;
  return (
    <div className="tab-content">
      <div className="section-title">
        <span className="soft-icon">
          <Wallet size={23} />
        </span>
        <div>
          <h2>
            Every{" "}
            {plan.input.currency === "INR"
              ? "rupee"
              : plan.input.currency === "USD"
                ? "dollar"
                : "euro"}
            , accounted for.
          </h2>
          <p>Thoughtful estimates. Real spending. No last-minute surprises.</p>
        </div>
      </div>
      <div className="budget-totals">
        <div>
          <span>Total planned</span>
          <strong>{money(plan.input.budget, plan.input.currency)}</strong>
        </div>
        <div>
          <span>Actually spent</span>
          <strong>{money(spent, plan.input.currency)}</strong>
        </div>
        <div className={remaining < 0 ? "negative" : ""}>
          <span>{remaining < 0 ? "Over budget" : "Still available"}</span>
          <strong>{money(Math.abs(remaining), plan.input.currency)}</strong>
        </div>
      </div>
      <section className="panel budget-table">
        <div className="budget-table-head">
          <span>Category</span>
          <span>Planned</span>
          <span>Actual spend</span>
          <span>Remaining</span>
        </div>
        {plan.budget.map((item) => (
          <div className="budget-table-row" key={item.id}>
            <span className="budget-category">
              <i style={{ background: item.color }} />
              {item.category}
            </span>
            <strong>{money(item.allocated, plan.input.currency)}</strong>
            <label className="spend-input">
              <span>
                {plan.input.currency === "INR"
                  ? "₹"
                  : plan.input.currency === "USD"
                    ? "$"
                    : "€"}
              </span>
              <input
                aria-label={`Actual spend for ${item.category}`}
                type="number"
                min="0"
                max="1000000000"
                step="1"
                value={item.spent}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isFinite(value) && value >= 0 && value <= 1e9)
                    onUpdate({
                      ...plan,
                      budget: plan.budget.map((b) =>
                        b.id === item.id
                          ? { ...b, spent: Math.round(value) }
                          : b,
                      ),
                    });
                }}
              />
            </label>
            <span className={item.allocated < item.spent ? "negative" : ""}>
              {money(item.allocated - item.spent, plan.input.currency)}
            </span>
          </div>
        ))}
        <div className="panel-note">
          <ShieldCheck size={17} />
          <span>
            These are planning estimates, not vendor quotes. Confirm taxes,
            deposits and cancellation terms.
          </span>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>The shape of your celebration</h2>
            <p>
              Allocations reflect your priorities, with a contingency reserve.
            </p>
          </div>
        </div>
        <BudgetDonut plan={plan} />
      </section>
    </div>
  );
}

export function TimelinePanel({
  plan,
  onUpdate,
}: {
  plan: EventPlan;
  onUpdate: UpdatePlan;
}) {
  const [filter, setFilter] = useState("All tasks");
  const tasks = plan.tasks.filter(
    (t) =>
      filter === "All tasks" ||
      (filter === "To do" ? !t.completed : t.completed),
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
          {["All tasks", "To do", "Completed"].map((f) => (
            <button
              key={f}
              aria-pressed={f === filter}
              className={f === filter ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
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
          tasks.map((t, index) => (
            <div className="timeline-entry" key={t.id}>
              <div className="timeline-marker">
                <span>{index + 1}</span>
              </div>
              <TaskRow plan={plan} task={t} onUpdate={onUpdate} />
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

export function VendorsPanel({
  plan,
  onUpdate,
}: {
  plan: EventPlan;
  onUpdate: UpdatePlan;
}) {
  return (
    <div className="tab-content">
      <div className="section-title">
        <span className="soft-icon">
          <UsersRound size={23} />
        </span>
        <div>
          <h2>Your people behind the party.</h2>
          <p>
            A checklist for finding the right partners, and asking the right
            questions.
          </p>
        </div>
      </div>
      <div className="vendor-disclaimer">
        <MapPin size={17} />
        <p>
          Research partners in {plan.input.city}. These are vendor requirements
          with budget allowances, not verified businesses or live quotes.
        </p>
      </div>
      <div className="vendor-grid">
        {plan.vendors.map((v) => (
          <section className="panel vendor-card" key={v.id}>
            <div className="vendor-top">
              <span className="vendor-icon">
                <UsersRound size={21} />
              </span>
              <select
                className={`status-select ${v.status.toLowerCase().replaceAll(" ", "-")}`}
                aria-label={`Status for ${v.category}`}
                value={v.status}
                onChange={(e) =>
                  onUpdate({
                    ...plan,
                    vendors: plan.vendors.map((item) =>
                      item.id === v.id
                        ? {
                            ...item,
                            status: e.target.value as Vendor["status"],
                          }
                        : item,
                    ),
                  })
                }
              >
                {["To research", "Shortlisted", "Booked"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <h3>{v.category}</h3>
            <p>{v.name}</p>
            <div className="vendor-budget">
              <span>Planning allowance</span>
              <strong>{money(v.estimate, plan.input.currency)}</strong>
            </div>
            <h4>Good questions to ask</h4>
            <ul>
              {v.questions.map((q) => (
                <li key={q}>
                  <Check size={13} />
                  {q}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

export function InspirationPanel({
  plan,
  onUpdate,
}: {
  plan: EventPlan;
  onUpdate: UpdatePlan;
}) {
  const [savedOnly, setSavedOnly] = useState(false);
  const ideas = plan.ideas.filter((i) => !savedOnly || i.saved);
  return (
    <div className="tab-content">
      <div className="section-title">
        <span className="soft-icon">
          <Lightbulb size={23} />
        </span>
        <div>
          <h2>Make it unmistakably yours.</h2>
          <p>Little ideas inspired by your {plan.input.style.toLowerCase()}.</p>
        </div>
      </div>
      <div className="tab-toolbar">
        <div className="segmented">
          <button
            className={!savedOnly ? "active" : ""}
            aria-pressed={!savedOnly}
            onClick={() => setSavedOnly(false)}
          >
            All ideas
          </button>
          <button
            className={savedOnly ? "active" : ""}
            aria-pressed={savedOnly}
            onClick={() => setSavedOnly(true)}
          >
            Saved ideas ({plan.ideas.filter((i) => i.saved).length})
          </button>
        </div>
        <span className="source-badge">
          <Sparkles size={13} />
          {plan.source === "gemini"
            ? "Personalized with Gemini"
            : "Curated planning ideas"}
        </span>
      </div>
      <div className="idea-grid">
        {ideas.map((idea, index) => (
          <article className="panel idea-card" key={idea.id}>
            <div className={`idea-image idea-tone-${index % 3}`}>
              <Image
                src={index % 2 ? "/images/party.jpg" : "/images/table.jpg"}
                alt=""
                fill
                sizes="(max-width: 700px) 100vw, 400px"
              />
              <button
                className={`save-idea ${idea.saved ? "saved" : ""}`}
                aria-label={`${idea.saved ? "Unsave" : "Save"} idea: ${idea.title}`}
                aria-pressed={idea.saved}
                onClick={() =>
                  onUpdate({
                    ...plan,
                    ideas: plan.ideas.map((i) =>
                      i.id === idea.id ? { ...i, saved: !i.saved } : i,
                    ),
                  })
                }
              >
                <Heart size={19} fill={idea.saved ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="idea-copy">
              <span className="idea-tag">{idea.tag}</span>
              <h3>{idea.title}</h3>
              <p>{idea.description}</p>
            </div>
          </article>
        ))}
      </div>
      {!ideas.length && (
        <div className="panel empty-state">
          <Heart size={30} />
          <h3>A place for your favorite ideas.</h3>
          <p>Tap the heart on an idea to keep it here.</p>
        </div>
      )}
      <div className="subtle-tip">
        <Plus size={17} />
        <p>
          Want a different direction? Tell your planning partner about a theme,
          tradition, or personal touch you’d love.
        </p>
      </div>
    </div>
  );
}
