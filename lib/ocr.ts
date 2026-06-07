/**
 * OCR post-processing (M5). Deterministic, no model call — decides whether a
 * Gemini-vision extraction is usable before it is offered to Interpret.
 *
 * PRD §11.7: low/empty extraction → do NOT run Interpret; the UI shows
 * "couldn't read" with Retake / Type-instead actions. Partial text is shown to
 * the user for confirmation before interpreting — so this gate only filters
 * clearly-unusable results, it does not try to be clever.
 */

/** Below this many meaningful characters the extraction is treated as unreadable. */
export const MIN_OCR_CHARS = 20;

export interface OcrAssessment {
  ok: boolean;
  /** Cleaned extraction (trimmed, normalised newlines) — empty when not ok. */
  text: string;
  reason?: "empty" | "too_short" | "mocked";
}

/**
 * Clean and assess an OCR extraction. Mock-prefixed results (quota/offline)
 * are never usable. CJK is counted like any other character — NHS letters are
 * English but the rule must not penalise non-Latin content.
 */
export function assessOcrText(raw: string): OcrAssessment {
  if (raw.startsWith("[mock:")) {
    return { ok: false, text: "", reason: "mocked" };
  }
  const text = raw
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (text.length === 0) {
    return { ok: false, text: "", reason: "empty" };
  }
  // Count characters that carry content (letters, digits, CJK) rather than
  // raw length, so a page of stray punctuation/noise does not pass.
  const meaningful = (text.match(/[\p{L}\p{N}]/gu) ?? []).length;
  if (meaningful < MIN_OCR_CHARS) {
    return { ok: false, text: "", reason: "too_short" };
  }
  return { ok: true, text };
}
