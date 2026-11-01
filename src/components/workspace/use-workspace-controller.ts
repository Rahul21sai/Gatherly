"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { EventInput, EventPlan } from "@/lib/types";
import type { Tab } from "../plans/props";
import { MAX_SAVED_EVENTS } from "@/lib/storage";
import {
  getWorkspaceSnapshot,
  getServerWorkspaceSnapshot,
  subscribeWorkspace,
  saveWorkspace,
} from "@/lib/workspace-store";
import { createEventPlan } from "@/lib/api-client";

export function useWorkspaceController(initialPlan: EventPlan) {
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
      const result = await createEventPlan(input);
      const next = {
        ...result.plan,
        id: replace ? plan.id : crypto.randomUUID(),
      };
      setPlans((current) =>
        replace
          ? current.map((p) => (p.id === plan.id ? next : p))
          : [next, ...current].slice(0, MAX_SAVED_EVENTS),
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

  function selectEvent(id: string) {
    setActiveId(id);
    setTab("Overview");
    setMobileNav(false);
  }
  function closeDialog() {
    if (!busy) setModal(null);
  }
  function cancelChange() {
    if (!busy) {
      setPendingPatch(null);
      setError("");
    }
  }
  return {
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
    openNavigation: () => setMobileNav(true),
    closeNavigation: () => setMobileNav(false),
    requestChange: (patch: Partial<EventInput>) => setPendingPatch(patch),
    dismissNotice: () => setNotice(""),
    notifyExport: () => setNotice("Your export is ready"),
  };
}
