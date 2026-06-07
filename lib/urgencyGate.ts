import { RED_FLAG_TERMS, RED_FLAG_TERMS_PL } from "./redFlags";

export interface RedFlagResult {
  hit: boolean;
  term?: string;
}

/**
 * Fold Polish text for tolerant matching: lowercase, strip combining
 * diacritics (ó→o, ą→a, …) and map ł→l (ł does not decompose under NFD).
 * Lets "silny bol glowy" typed without Polish keys still hit "silny ból głowy".
 */
function foldPolish(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l");
}

// Pure, synchronous red-flag detection. Runs BEFORE any model call.
// Checks EVERY language list regardless of the user's selected language —
// adding a language can only ever ADD detection, never remove it.
export function detectRedFlag(text: string): RedFlagResult {
  if (!text) return { hit: false };

  // EN terms are stored lowercase; lowercasing is a no-op for zh/hi/ur, so one
  // normalised pass covers en, zh, hi, ur and diacritic-correct pl.
  const normalized = text.toLowerCase();
  for (const terms of Object.values(RED_FLAG_TERMS)) {
    for (const term of terms) {
      if (normalized.includes(term)) return { hit: true, term };
    }
  }

  // Second pass for Polish typed without diacritics.
  const folded = foldPolish(text);
  for (const term of RED_FLAG_TERMS_PL) {
    if (folded.includes(foldPolish(term))) return { hit: true, term };
  }

  return { hit: false };
}
