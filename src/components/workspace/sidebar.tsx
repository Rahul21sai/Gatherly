"use client";
import Link from "next/link";
import {
  LayoutDashboard,
  Wallet,
  ListChecks,
  UsersRound,
  Lightbulb,
  Plus,
  ChevronDown,
  Heart,
  Flower2,
  CircleHelp,
} from "lucide-react";
import type { EventPlan } from "@/lib/types";
import type { Tab } from "../plans/props";
const nav = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Budget", icon: Wallet },
  { name: "Timeline", icon: ListChecks },
  { name: "Vendors", icon: UsersRound },
  { name: "Inspiration", icon: Lightbulb },
] as const;

interface SidebarProps {
  plans: EventPlan[];
  plan: EventPlan;
  tab: Tab;
  onSelectEvent: (id: string) => void;
  goTab: (tab: Tab) => void;
  openModal: (modal: "new" | "help") => void;
}
export default function WorkspaceSidebar({
  plans,
  plan,
  tab,
  onSelectEvent,
  goTab,
  openModal,
}: SidebarProps) {
  return (
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
          onChange={(event) => onSelectEvent(event.target.value)}
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
}
