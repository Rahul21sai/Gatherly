"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Sparkles,
  WandSparkles,
  ChevronRight,
  RotateCcw,
  LoaderCircle,
} from "lucide-react";
import type { EventInput, EventPlan, Suggestion } from "@/lib/types";
import { askPlanningAssistant } from "@/lib/api-client";

interface Message {
  role: "user" | "assistant";
  text: string;
  mode?: "offline" | "gemini";
  suggestions?: Suggestion[];
}
export default function Assistant({
  plan,
  onSuggestion,
}: {
  plan: EventPlan;
  onSuggestion: (patch: Partial<EventInput>) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState(false);
  const history = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setConfigured(d.configured === true))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (messages.length)
      history.current?.scrollTo({
        top: history.current.scrollHeight,
        behavior: "smooth",
      });
  }, [messages, busy]);
  async function send(text: string) {
    if (!text.trim() || busy) return;
    const question = text.trim().slice(0, 1500);
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setBusy(true);
    try {
      const answer = await askPlanningAssistant(plan.input, plan, question);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: answer.reply + (answer.warning ? `\n\n${answer.warning}` : ""),
          mode: answer.mode,
          suggestions: answer.suggestions,
        },
      ]);
    } catch (error) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Couldn’t connect. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="assistant panel" aria-label="Planning assistant">
      <div className="assistant-heading">
        <span className="assistant-symbol">
          <Sparkles size={21} />
        </span>
        <div>
          <h2>Your planning partner</h2>
          <span className="assistant-status">
            <i />
            {configured ? "Gemini configured" : "Offline planning mode"}
          </span>
        </div>
        <button
          className="icon-button"
          onClick={() => setMessages([])}
          aria-label="Clear conversation"
          title="Clear conversation"
        >
          <RotateCcw size={16} />
        </button>
      </div>
      <div
        className="assistant-history"
        ref={history}
        role="log"
        aria-live="polite"
        aria-label="Assistant conversation"
      >
        {!messages.length && (
          <div className="assistant-welcome">
            <div className="welcome-sparkles">
              <WandSparkles size={27} />
            </div>
            <h3>
              A little help.
              <br />A lot less overwhelm.
            </h3>
            <p>
              I have your event details. Let’s make the budget work, find your
              vibe, or figure out what’s next.
            </p>
            <div className="assistant-starters">
              {[
                "How can I make my budget go further?",
                "What should I do first?",
                "Reduce my budget by 15%",
              ].map((text) => (
                <button key={text} onClick={() => send(text)}>
                  {text}
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.role}`}>
            <span className="message-author">
              {message.role === "user"
                ? "You"
                : message.mode === "gemini"
                  ? "Gatherly · Gemini"
                  : "Gatherly · Offline planner"}
            </span>
            <p
              data-testid={
                message.role === "assistant" ? "assistant-reply" : undefined
              }
            >
              {message.text}
            </p>
            {message.suggestions?.map((s, i) => (
              <button
                className="suggestion-button"
                key={i}
                data-testid="assistant-suggestion"
                onClick={() => onSuggestion(s.patch)}
              >
                {s.label}
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        ))}
        {busy && (
          <p className="assistant-loading">
            <LoaderCircle className="spin" size={15} />
            Thinking through the details…
          </p>
        )}
      </div>
      <form
        className="assistant-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <textarea
          rows={2}
          aria-label="Message your planning assistant"
          placeholder="A thought, a question, a little what-if…"
          value={input}
          maxLength={1500}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
        />
        <div>
          <span>Your event details stay in context</span>
          <button aria-label="Send message" disabled={busy || !input.trim()}>
            <ArrowUp size={18} />
          </button>
        </div>
      </form>
      <p className="assistant-disclaimer">
        {configured
          ? "Event details are sent to Google Gemini when you ask."
          : "Offline suggestions follow event-planning rules."}{" "}
        Always confirm quotes with vendors.
      </p>
    </section>
  );
}
