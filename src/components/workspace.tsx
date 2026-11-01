"use client";
import Image from "next/image";
import {
  Plus,
  ArrowRight,
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
  Flower2,
} from "lucide-react";
import type { EventPlan } from "@/lib/types";
import { dateLabel, daysTo } from "@/lib/format";
import Assistant from "./assistant";
import { Metrics } from "./plans/shared";
import { Overview } from "./plans/overview";
import { BudgetPanel } from "./plans/budget";
import { TimelinePanel } from "./plans/timeline";
import { VendorsPanel } from "./plans/vendors";
import { InspirationPanel } from "./plans/inspiration";
import { useWorkspaceController } from "./workspace/use-workspace-controller";
import WorkspaceSidebar from "./workspace/sidebar";
import WorkspaceDialogs from "./workspace/dialogs";
const eventLabels = {
  wedding: "Wedding celebration",
  birthday: "Birthday celebration",
  community: "Community gathering",
};

export default function Workspace({ initialPlan }: { initialPlan: EventPlan }) {
  const {
    plans,
    plan,
    loaded,
    tab,
    mobileNav,
    modal,
    pendingPatch,
    busy,
    error,
    notice,
    storageError,
    newInput,
    updatePlan,
    goTab,
    openModal,
    generate,
    selectEvent,
    closeDialog,
    cancelChange,
    openNavigation,
    closeNavigation,
    requestChange,
    dismissNotice,
    notifyExport,
  } = useWorkspaceController(initialPlan);
  const sidebar = (
    <WorkspaceSidebar
      plans={plans}
      plan={plan}
      tab={tab}
      onSelectEvent={selectEvent}
      goTab={goTab}
      openModal={openModal}
    />
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
        <div className="mobile-nav-backdrop" onClick={() => closeNavigation()}>
          <aside
            className="mobile-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="mobile-close icon-button"
              aria-label="Close navigation"
              onClick={() => closeNavigation()}
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
              onClick={() => openNavigation()}
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
                onSuggestion={requestChange}
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
            onClick={() => dismissNotice()}
          >
            <X size={15} />
          </button>
        </div>
      )}
      <WorkspaceDialogs
        modal={modal}
        plan={plan}
        newInput={newInput}
        busy={busy}
        error={error}
        pendingPatch={pendingPatch}
        onClose={closeDialog}
        onCancelChange={cancelChange}
        onGenerate={generate}
        onExport={notifyExport}
      />
    </div>
  );
}
