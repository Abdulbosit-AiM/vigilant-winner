// ============================================================
// Local (on-device) conversation storage. Interpreted letters /
// recorded conversations are saved ONLY in localStorage — never uploaded.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { nanoid } from "nanoid";

const STORAGE_KEY = "maternify_conversations";

export interface SavedConversation {
  id: string;
  date: string; // ISO timestamp
  inputText: string;
  documentType: string;
  explanationEn: string;
}

function load(): SavedConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SavedConversation[];
  } catch {
    // ignore
  }
  return [];
}

export function useConversations() {
  const [items, setItems] = useState<SavedConversation[]>([]);

  // Read after mount to avoid SSR/client mismatch.
  useEffect(() => {
    setItems(load());
  }, []);

  const persist = useCallback((next: SavedConversation[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const save = useCallback(
    (conv: Omit<SavedConversation, "id" | "date">) => {
      const entry: SavedConversation = {
        ...conv,
        id: nanoid(),
        date: new Date().toISOString(),
      };
      persist([entry, ...load()]);
      return entry;
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(load().filter((c) => c.id !== id));
    },
    [persist],
  );

  return { items, save, remove };
}
