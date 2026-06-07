/**
 * Single source of truth for supported languages (PRD §11.6).
 * Mandarin is the primary demo language; Hindi, Urdu and Polish ship with the
 * same guarantees: red-flag terms in lib/redFlags.ts, UI strings in the flow
 * components, emergency-card copy in lib/emergencyCard.ts. Adding a language
 * here without those three pieces is a type error, not a silent gap.
 */

export const LANGS = ["en", "zh", "hi", "ur", "pl"] as const;
export type Lang = (typeof LANGS)[number];
export type NativeLang = Exclude<Lang, "en">;

/** Selector labels — each language in its own script. */
export const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  zh: "中文",
  hi: "हिन्दी",
  ur: "اردو",
  pl: "PL",
};

/** Right-to-left languages — native text blocks get dir="rtl". */
export const RTL_LANGS: readonly Lang[] = ["ur"];

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/**
 * Cheap script heuristic when no language is requested (PRD §11.6). No model
 * call. Polish is Latin-script, so it is only detected via its distinctive
 * diacritics; plain-ASCII Polish falls back to English, which is safe — the
 * red-flag gate checks every language list regardless of the resolved lang.
 */
export function resolveLang(requested: unknown, text: string): Lang {
  if (isLang(requested)) return requested;
  if (/[\u4e00-\u9fff]/.test(text)) return "zh"; // CJK
  if (/[\u0900-\u097f]/.test(text)) return "hi"; // Devanagari
  if (/[\u0600-\u06ff\u0750-\u077f]/.test(text)) return "ur"; // Arabic script
  if (/[ąćęłńśźż]/i.test(text)) return "pl"; // Polish diacritics
  return "en";
}
