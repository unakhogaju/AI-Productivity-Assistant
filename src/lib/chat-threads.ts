import { useCallback, useEffect, useState } from "react";
import type { UIMessage } from "ai";

const STORAGE_KEY = "aria.chat.threads.v1";

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

function readThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatThread[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeThreads(threads: ChatThread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function newThread(): ChatThread {
  return {
    id: makeId(),
    title: "New chat",
    updatedAt: Date.now(),
    messages: [],
  };
}

export function useThreads() {
  const [threads, setThreads] = useState<ChatThread[]>(() => readThreads());

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setThreads(readThreads());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: ChatThread[]) => {
    setThreads(next);
    writeThreads(next);
  }, []);

  const upsert = useCallback(
    (thread: ChatThread) => {
      const current = readThreads();
      const idx = current.findIndex((t) => t.id === thread.id);
      const next =
        idx === -1
          ? [thread, ...current]
          : current.map((t) => (t.id === thread.id ? thread : t));
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      persist(next);
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(readThreads().filter((t) => t.id !== id));
    },
    [persist],
  );

  return { threads, upsert, remove };
}

export function getThread(id: string): ChatThread | undefined {
  return readThreads().find((t) => t.id === id);
}
