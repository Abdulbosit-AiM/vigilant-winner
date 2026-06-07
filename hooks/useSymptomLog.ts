// ============================================================
// Symptom log hook — localStorage persistence, one entry per day.
// Seeds the last 7 days on first run so Patterns has data to detect.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import {
  buildSeedEntries,
  type SymptomLogEntry,
} from "@/lib/symptomLog";

const STORAGE_KEY = "maternify_symptom_log";

function load(): SymptomLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SymptomLogEntry[];
  } catch {
    // ignore
  }
  const seed = buildSeedEntries();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  } catch {
    // ignore
  }
  return seed;
}

export function useSymptomLog() {
  const [entries, setEntries] = useState<SymptomLogEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEntries(load());
    setReady(true);
  }, []);

  const persist = useCallback((next: SymptomLogEntry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  /** Insert or overwrite the entry for a given day (one entry per date). */
  const upsertEntry = useCallback(
    (date: string, data: Omit<SymptomLogEntry, "id" | "date">) => {
      const existing = entries.find((e) => e.date === date);
      const next = existing
        ? entries.map((e) => (e.date === date ? { ...e, ...data, date } : e))
        : [...entries, { ...data, date, id: nanoid() }];
      persist(next);
    },
    [entries, persist],
  );

  const getByDate = useCallback(
    (date: string) => entries.find((e) => e.date === date) ?? null,
    [entries],
  );

  const clearAll = useCallback(() => persist([]), [persist]);

  return { entries, ready, upsertEntry, getByDate, clearAll };
}
