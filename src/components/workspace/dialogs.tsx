"use client";
import {
  Sparkles,
  ArrowRight,
  Heart,
  Download,
  ArrowUpRight,
} from "lucide-react";
import type { EventInput, EventPlan } from "@/lib/types";
import { downloadFile, toCalendar, toPlanMarkdown } from "@/lib/export";
import EventForm from "../event-form";
import Modal from "../modal";
interface WorkspaceDialogsProps {
  modal: "new" | "edit" | "help" | "export" | null;
  plan: EventPlan;
  newInput: EventInput;
  busy: boolean;
  error: string;
  pendingPatch: Partial<EventInput> | null;
  onClose: () => void;
  onCancelChange: () => void;
  onGenerate: (input: EventInput, replace: boolean) => Promise<void>;
  onExport: () => void;
}
export default function WorkspaceDialogs({
  modal,
  plan,
  newInput,
  busy,
  error,
  pendingPatch,
  onClose,
  onCancelChange,
  onGenerate,
  onExport,
}: WorkspaceDialogsProps) {
  return (
    <>
      {(modal === "new" || modal === "edit") && (
        <Modal
          title={
            modal === "new"
              ? "Let’s plan something lovely."
              : "A few little adjustments."
          }
          onClose={() => {
            if (!busy) onClose();
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
            onSubmit={(input) => onGenerate(input, modal === "edit")}
          />
        </Modal>
      )}
      {pendingPatch && (
        <Modal
          title="Update your plan?"
          onClose={() => {
            if (!busy) {
              onCancelChange();
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
                  onCancelChange();
                }}
              >
                Keep current plan
              </button>
              <button
                className="button primary"
                disabled={busy}
                onClick={() =>
                  onGenerate({ ...plan.input, ...pendingPatch }, true)
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
        <Modal title="A little help, right here." onClose={() => onClose()}>
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
            <button className="button primary" onClick={() => onClose()}>
              Back to the good things
              <Heart size={16} />
            </button>
          </div>
        </Modal>
      )}
      {modal === "export" && (
        <Modal title="Your plan, wherever you go." onClose={() => onClose()}>
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
                  onExport();
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
    </>
  );
}
