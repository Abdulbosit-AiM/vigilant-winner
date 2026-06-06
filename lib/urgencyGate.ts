import { RED_FLAG_TERMS_EN, RED_FLAG_TERMS_ZH } from "./redFlags";

export interface RedFlagResult {
  hit: boolean;
  term?: string;
}

// Pure, synchronous red-flag detection. Runs BEFORE any model call.
// Checks both language lists regardless of the user's selected language.
export function detectRedFlag(text: string): RedFlagResult {
  if (!text) return { hit: false };

  const normalizedEn = text.toLowerCase();
  for (const term of RED_FLAG_TERMS_EN) {
    if (normalizedEn.includes(term)) return { hit: true, term };
  }

  for (const term of RED_FLAG_TERMS_ZH) {
    if (text.includes(term)) return { hit: true, term };
  }

  return { hit: false };
}
