"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Wallet,
  ListChecks,
  UsersRound,
  Lightbulb,
  Plus,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  MapPin,
  Users,
  ArrowUpRight,
  Sparkles,
  Heart,
  Menu,
  X,
  CircleHelp,
  Download,
  Pencil,
  Check,
  AlertTriangle,
  ArrowRight,
  Flower2,
} from "lucide-react";
import type { EventInput, EventPlan, PlanResponse } from "@/lib/types";
import { dateLabel, daysTo } from "@/lib/format";
import {
  getWorkspaceSnapshot,
  getServerWorkspaceSnapshot,
  subscribeWorkspace,
  saveWorkspace,
} from "@/lib/workspace-store";
import { downloadFile, toCalendar, toPlanMarkdown } from "@/lib/export";
import Assistant from "./assistant";
import EventForm from "./event-form";
import Modal from "./modal";
import {
  Metrics,
  Overview,
  BudgetPanel,
  TimelinePanel,
  VendorsPanel,
  InspirationPanel,
  type Tab,
} from "./plan-panels";

const nav = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Budget", icon: Wallet },
  { name: "Timeline", icon: ListChecks },
  { name: "Vendors", icon: UsersRound },
  { name: "Inspiration", icon: Lightbulb },
] as const;
const eventLabels = {
  wedding: "Wedding celebration",
  birthday: "Birthday celebration",
  community: "Community gathering",
};

export default function Workspace({ initialPlan }: { initialPlan: EventPlan }) {
  const workspace = useSyncExternalStore(
    subscribeWorkspace,
    getWorkspaceSnapshot,
    getServerWorkspaceSnapshot,
  );
  const plans = workspace?.plans.length ? workspace.plans : [initialPlan];
  const loaded = workspace !== null;
  function setPlans(update: (current: EventPlan[]) => EventPlan[]) {
    const current = getWorkspaceSnapshot()?.plans;
    saveWorkspace(update(current?.length ? current : [initialPlan]));
  }
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [modal, setModal] = useState<"new" | "edit" | "help" | "export" | null>(
    null,
  );
  const [pendingPatch, setPendingPatch] = useState<Partial<EventInput> | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const storageError = workspace?.storageError ?? false;
  const plan = plans.find((p) => p.id === activeId) || plans[0] || initialPlan;
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  function updatePlan(next: EventPlan) {
    setPlans((current) => current.map((p) => (p.id === next.id ? next : p)));
  }
  function goTab(next: Tab) {
    setTab(next);
    setMobileNav(false);
  }
  function openModal(next: typeof modal) {
    setError("");
    setModal(next);
  }
  async function generate(input: EventInput, replace: boolean) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Check the event details and try again.",
        );
      const result = data as PlanResponse;
      const next = {
        ...result.plan,
        id: replace ? plan.id : crypto.randomUUID(),
      };
      setPlans((current) =>
        replace
          ? current.map((p) => (p.id === plan.id ? next : p))
          : [next, ...current].slice(0, 20),
      );
      setActiveId(next.id);
      setTab("Overview");
      setModal(null);
      setPendingPatch(null);
      setNotice(replace ? "Plan updated" : "Your celebration is taking shape");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Couldn’t create the plan. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  const newInput: EventInput = {
    ...plan.input,
    title: "",
    eventType: "wedding",
    guests: 50,
    budget: 100000,
    style: "Intimate and thoughtful",
    priorities: [],
    notes: "",
  };
  const sidebar = (
    <>
      <Link className="brand" href="/" aria-label="Gatherly home">
        <span className="brand-mark">
          <Flower2 size={28} strokeWidth={1.8} />
        </span>
        gatherly<span className="brand-dot">.</span>
      </Link>
      <div className="workspace-label">Your workspace</div>
      <label className="event-switcher">
        <span className="event-switcher-icon">
          <Heart size={18} />
        </span>
        <select
          aria-label="Switch event"
          value={plan.id}
          onChange={(e) => {
            setActiveId(e.target.value);
            setTab("Overview");
            setMobileNav(false);
          }}
        >
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.input.title}
            </option>
          ))}
        </select>
        <ChevronDown size={15} />
      </label>
      <nav aria-label="Event navigation">
        {nav.map(({ name, icon: Icon }) => (
          <button
            key={name}
            className={`nav-item ${tab === name ? "active" : ""}`}
            aria-current={tab === name ? "page" : undefined}
            onClick={() => goTab(name)}
          >
            <Icon size={19} strokeWidth={1.7} />
            <span>{name}</span>
            {tab === name && <span className="nav-active-dot" />}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip">
          <span className="tip-flower">
            <Flower2 size={29} />
          </span>
          <h3>
            Less planning.
            <br />
            More happy moments.
          </h3>
          <p>
            We’ll take care of the details.
            <br />
            You make the memories.
          </p>
          <button onClick={() => openModal("new")}>
            Plan something lovely
            <Plus size={15} />
          </button>
        </div>
        <button className="help-link" onClick={() => openModal("help")}>
          <CircleHelp size={17} />A little help
        </button>
        <div className="sidebar-footer">
          <span className="user-avatar">Y</span>
          <div>
            <strong>Your personal space</strong>
            <span>Saved on this device</span>
          </div>
          <span className="online-dot" />
        </div>
      </div>
    </>
  );
  return (
    <div
      className="app-shell"
      data-ready={loaded ? "true" : "false"}
      aria-busy={!loaded}
    >
      <a href="#main-content" className="skip-link">
        Skip to event plan
      </a>
      <aside className="sidebar">{sidebar}</aside>
      {mobileNav && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileNav(false)}
        >
          <aside
            className="mobile-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="mobile-close icon-button"
              aria-label="Close navigation"
              onClick={() => setMobileNav(false)}
            >
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{tab}</strong>
          </div>
          <div className="topbar-right">
            <span className="saved-status">
              <i />
              {storageError
                ? "Session only · storage unavailable"
                : "All the little details, saved"}
            </span>
            <button
              className="icon-button"
              aria-label="Help and privacy"
              onClick={() => openModal("help")}
            >
              <CircleHelp size={19} />
            </button>
            <span className="topbar-avatar">Y</span>
          </div>
        </header>
        <main id="main-content" className="main-content">
          <div className="page-heading">
            <div>
              <div className="greeting">
                <span className="greeting-sun">☀</span> A good day to make good
                memories
              </div>
              <h1>
                {tab === "Overview"
                  ? "Let’s make it memorable."
                  : tab === "Budget"
                    ? "A little clarity goes a long way."
                    : tab === "Timeline"
                      ? "Good things take a little planning."
                      : tab === "Vendors"
                        ? "Great moments take great people."
                        : "Your celebration, your kind of magic."}
              </h1>
              <p>
                {tab === "Overview"
                  ? "Big moments. Little details. All in one happy place."
                  : `${plan.input.title} · ${plan.input.city}`}
              </p>
            </div>
            <button
              className="button primary new-event"
              disabled={!loaded}
              onClick={() => openModal("new")}
            >
              <Plus size={18} />
              New event
            </button>
          </div>
          {plan.id === "gatherly-sample" && (
            <div className="sample-label">
              <span>Make yourself at home</span> You’re exploring a sample
              event. Create one to make it yours.
              <button onClick={() => openModal("new")}>
                Let’s start
                <ArrowRight size={13} />
              </button>
            </div>
          )}
          {tab === "Overview" && (
            <>
              <section className={`event-hero ${plan.input.eventType}`}>
                <Image
                  src={
                    plan.input.eventType === "wedding"
                      ? "/images/celebration.jpg"
                      : plan.input.eventType === "birthday"
                        ? "/images/party.jpg"
                        : "/images/table.jpg"
                  }
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 1200px"
                />
                <div className="hero-shade" />
                <div className="hero-content">
                  <span className="event-type">
                    <Heart size={13} />
                    {eventLabels[plan.input.eventType]}
                  </span>
                  <h2>{plan.input.title}</h2>
                  <p>{plan.input.style}</p>
                  <div className="event-details">
                    <span>
                      <CalendarDays size={14} />
                      {dateLabel(plan.input.date)}
                    </span>
                    <span>
                      <MapPin size={14} />
                      {plan.input.city}
                    </span>
                    <span>
                      <Users size={14} />
                      {plan.input.guests} guests
                    </span>
                  </div>
                  <button
                    className="button hero-button"
                    onClick={() => openModal("edit")}
                  >
                    <Pencil size={14} />
                    Edit event
                    <ArrowUpRight size={14} />
                  </button>
                </div>
                <div className="hero-countdown">
                  <span>{daysTo(plan.input.date)}</span>
                  <small>
                    days to a<br />
                    beautiful memory
                  </small>
                  <Sparkles size={17} />
                </div>
              </section>
              <Metrics plan={plan} />
            </>
          )}
          <div className="workspace-grid">
            <div className="workspace-main">
              {tab === "Overview" ? (
                <Overview plan={plan} onUpdate={updatePlan} onTab={goTab} />
              ) : tab === "Budget" ? (
                <BudgetPanel plan={plan} onUpdate={updatePlan} />
              ) : tab === "Timeline" ? (
                <TimelinePanel plan={plan} onUpdate={updatePlan} />
              ) : tab === "Vendors" ? (
                <VendorsPanel plan={plan} onUpdate={updatePlan} />
              ) : (
                <InspirationPanel plan={plan} onUpdate={updatePlan} />
              )}
            </div>
            <div className="workspace-aside">
              <Assistant
                key={plan.id + plan.generatedAt}
                plan={plan}
                onSuggestion={setPendingPatch}
              />
              <div className="event-summary-note">
                <Heart size={17} />
                <div>
                  <strong>A plan with a little breathing room.</strong>
                  <p>{plan.summary}</p>
                </div>
              </div>
              {plan.warnings.length > 0 && (
                <details className="planning-warnings">
                  <summary>
                    <AlertTriangle size={15} />
                    {plan.warnings.length} things to keep in mind
                    <ChevronDown size={14} />
                  </summary>
                  <ul>
                    {plan.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
          <footer className="page-footer">
            <span>
              <Flower2 size={15} />
              Made for the moments that matter.
            </span>
            <button onClick={() => openModal("export")}>
              <Download size={14} />
              Take your plan with you
            </button>
            <span className="source-badge">
              <Sparkles size={12} />
              {plan.source === "gemini"
                ? "Ideas with Gemini"
                : "Offline planning mode"}
            </span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {(modal === "new" || modal === "edit") && (
        <Modal
          title={
            modal === "new"
              ? "Let’s plan something lovely."
              : "A few little adjustments."
          }
          onClose={() => {
            if (!busy) setModal(null);
          }}
          wide
        >
          {modal === "edit" && (
            <p className="edit-warning">
              A fresh plan will replace your current allocations, task progress,
              vendor statuses, and saved ideas. Export your plan first if you’d
              like to keep a copy.
            </p>
          )}
          <EventForm
            initial={modal === "edit" ? plan.input : newInput}
            busy={busy}
            error={error}
            onSubmit={(input) => generate(input, modal === "edit")}
          />
        </Modal>
      )}
      {pendingPatch && (
        <Modal
          title="Update your plan?"
          onClose={() => {
            if (!busy) {
              setPendingPatch(null);
              setError("");
            }
          }}
        >
          <div className="confirm-body">
            <span className="soft-icon">
              <Sparkles size={24} />
            </span>
            <p>Your assistant suggests these changes:</p>
            <dl className="patch-list">
              {Object.entries(pendingPatch).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>
                    {Array.isArray(value) ? value.join(", ") : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="edit-warning">
              This creates a fresh plan. Current task progress, spending
              entries, vendor statuses, and saved ideas will reset.
            </p>
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
            <div className="dialog-actions">
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => {
                  setPendingPatch(null);
                  setError("");
                }}
              >
                Keep current plan
              </button>
              <button
                className="button primary"
                disabled={busy}
                onClick={() =>
                  generate({ ...plan.input, ...pendingPatch }, true)
                }
              >
                {busy ? "Updating…" : "Update plan"}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Modal>
      )}
      {modal === "help" && (
        <Modal
          title="A little help, right here."
          onClose={() => setModal(null)}
        >
          <div className="help-content">
            <h3>Start with the occasion.</h3>
            <p>
              Create a wedding, birthday, or community event. Your priorities
              shape the budget, and your event date sets the timeline.
            </p>
            <h3>Make the plan your own.</h3>
            <p>
              Track actual spending in Budget, check off Timeline tasks,
              shortlist vendors, and save ideas. Ask your planning partner for
              advice or a change; you choose when to apply it.
            </p>
            <h3>A thoughtful place for your details.</h3>
            <p>
              Plans save in this browser on this device. Clearing browser data
              removes them. Use the export to keep a copy. No account, cloud
              backup, bookings, or actual vendor search is included.
            </p>
            <h3>Know where the advice comes from.</h3>
            <p>
              The offline planner uses clearly labeled planning rules. When AI
              is enabled, event details and your question are sent to Google for
              personalized text. Costs and dates are always calculated by the
              app. Avoid sensitive guest information.
            </p>
            <h3>Ideas, with practical limits.</h3>
            <p>
              Budget allowances are estimates, not quotes. Confirm availability,
              safety, local permits, accessibility, taxes and contracts with
              your vendors.
            </p>
            <button className="button primary" onClick={() => setModal(null)}>
              Back to the good things
              <Heart size={16} />
            </button>
          </div>
        </Modal>
      )}
      {modal === "export" && (
        <Modal
          title="Your plan, wherever you go."
          onClose={() => setModal(null)}
        >
          <div className="export-options">
            {[
              {
                label: "Complete plan",
                description: "A JSON copy of your event and tracked progress",
                action: () =>
                  downloadFile(
                    JSON.stringify(plan, null, 2),
                    "gatherly-plan.json",
                    "application/json",
                  ),
              },
              {
                label: "Readable event brief",
                description: "A Markdown summary to share with your people",
                action: () =>
                  downloadFile(
                    toPlanMarkdown(plan),
                    "gatherly-event-brief.md",
                    "text/markdown",
                  ),
              },
              {
                label: "Calendar reminders",
                description: "An .ics file of your unfinished planning tasks",
                action: () =>
                  downloadFile(
                    toCalendar(plan),
                    "gatherly-timeline.ics",
                    "text/calendar",
                  ),
              },
            ].map(({ label, description, action }) => (
              <button
                key={label}
                onClick={() => {
                  action();
                  setNotice("Your export is ready");
                }}
              >
                <span className="soft-icon">
                  <Download size={21} />
                </span>
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
                <ArrowUpRight size={18} />
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
