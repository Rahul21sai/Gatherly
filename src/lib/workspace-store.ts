import { parseWorkspace, STORAGE_KEY } from "./storage";
import type { EventPlan } from "./types";

interface WorkspaceSnapshot {
  plans: EventPlan[];
  storageError: boolean;
}

let snapshot: WorkspaceSnapshot | null = null;
const listeners = new Set<() => void>();

export function getWorkspaceSnapshot(): WorkspaceSnapshot | null {
  if (typeof window === "undefined") return null;
  if (!snapshot) {
    try {
      snapshot = {
        plans: parseWorkspace(window.localStorage.getItem(STORAGE_KEY)),
        storageError: false,
      };
    } catch {
      snapshot = { plans: [], storageError: true };
    }
  }
  return snapshot;
}

export function getServerWorkspaceSnapshot(): null {
  return null;
}

function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  snapshot = null;
  listeners.forEach((listener) => listener());
}

export function subscribeWorkspace(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", handleStorage);
  };
}

export function saveWorkspace(plans: EventPlan[]) {
  let storageError = false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch {
    storageError = true;
  }
  snapshot = { plans, storageError };
  listeners.forEach((listener) => listener());
}
