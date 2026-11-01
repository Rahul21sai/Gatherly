"use client";

import { useState } from "react";
import {
  Cake,
  Heart,
  UsersRound,
  Sparkles,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import type { EventInput, EventType } from "@/lib/types";
import { planningToday } from "@/lib/dates";

const kinds = [
  { id: "wedding", label: "Wedding", icon: Heart, detail: "Your next chapter" },
  {
    id: "birthday",
    label: "Birthday",
    icon: Cake,
    detail: "Another wonderful year",
  },
  {
    id: "community",
    label: "Community",
    icon: UsersRound,
    detail: "Better together",
  },
] as const;
const priorities = [
  "Food",
  "Decor",
  "Photography",
  "Music",
  "Venue",
  "Accessibility",
];
export default function EventForm({
  initial,
  busy,
  error,
  onSubmit,
}: {
  initial: EventInput;
  busy: boolean;
  error: string;
  onSubmit: (input: EventInput) => void;
}) {
  const [form, setForm] = useState<EventInput>(initial);
  const set = <K extends keyof EventInput>(key: K, value: EventInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const today = planningToday();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="event-form"
    >
      <div className="form-intro">
        <span className="soft-icon">
          <Sparkles size={22} />
        </span>
        <p>Tell us a little. We’ll bring the details together.</p>
      </div>
      <fieldset className="kind-fieldset">
        <legend>What are we celebrating?</legend>
        <div className="kind-options">
          {kinds.map(({ id, label, icon: Icon, detail }) => (
            <button
              type="button"
              key={id}
              className={`kind-option ${form.eventType === id ? "selected" : ""}`}
              onClick={() => set("eventType", id as EventType)}
              aria-label={label}
              aria-describedby={`kind-${id}-description`}
              aria-pressed={form.eventType === id}
            >
              <Icon size={22} />
              <strong>{label}</strong>
              <small id={`kind-${id}-description`}>{detail}</small>
            </button>
          ))}
        </div>
      </fieldset>
      <label>
        Event name
        <input
          required
          maxLength={120}
          value={form.title}
          placeholder="Give your celebration a name"
          onChange={(e) => set("title", e.target.value)}
          autoComplete="off"
        />
      </label>
      <div className="form-row">
        <label>
          City
          <input
            required
            maxLength={80}
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Where good things happen"
          />
        </label>
        <label>
          Event date
          <input
            type="date"
            required
            min={today}
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </label>
      </div>
      <div className="form-row three">
        <label>
          Guest count
          <input
            type="number"
            required
            min="1"
            max="10000"
            step="1"
            value={form.guests || ""}
            onChange={(e) => set("guests", Number(e.target.value))}
          />
        </label>
        <label>
          Total budget
          <input
            type="number"
            required
            min="100"
            max="100000000"
            step="1"
            value={form.budget || ""}
            onChange={(e) => set("budget", Number(e.target.value))}
          />
        </label>
        <label>
          Currency
          <select
            value={form.currency}
            onChange={(e) =>
              set("currency", e.target.value as EventInput["currency"])
            }
          >
            <option value="INR">INR ₹</option>
            <option value="USD">USD $</option>
            <option value="EUR">EUR €</option>
          </select>
        </label>
      </div>
      <label>
        The vibe
        <input
          maxLength={150}
          required
          value={form.style}
          onChange={(e) => set("style", e.target.value)}
          placeholder="A garden brunch, a colorful street party…"
        />
      </label>
      <fieldset>
        <legend>
          What matters most? <span className="muted">Pick your priorities</span>
        </legend>
        <div className="priority-options">
          {priorities.map((p) => (
            <button
              type="button"
              key={p}
              aria-pressed={form.priorities.includes(p)}
              className={`chip ${form.priorities.includes(p) ? "selected" : ""}`}
              onClick={() =>
                set(
                  "priorities",
                  form.priorities.includes(p)
                    ? form.priorities.filter((v) => v !== p)
                    : [...form.priorities, p],
                )
              }
            >
              {p}
            </button>
          ))}
        </div>
      </fieldset>
      <label>
        Anything else we should know? <span className="muted">Optional</span>
        <textarea
          value={form.notes}
          maxLength={2000}
          rows={3}
          placeholder="Dietary needs, cultural traditions, accessibility, the little things…"
          onChange={(e) => set("notes", e.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="form-footer">
        <p>A practical plan, with room for your personality.</p>
        <button className="button primary" disabled={busy} type="submit">
          {busy ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <Sparkles size={17} />
          )}{" "}
          {busy ? "Bringing it together…" : "Create my plan"}
          {!busy && <ArrowRight size={17} />}
        </button>
      </div>
    </form>
  );
}
