/**
 * Reusable structured-generation helper: GLM (glm-5.1) primary, live Gemini
 * (gemini-2.5-flash) fallback for REAL generation, validated fallback only if
 * both fail. Used by Express (M2) and Interpret (M3).
 *
 * The system prompt is passed separately in BOTH paths and never concatenated
 * with user input (prompt-injection defence).
 */
import { glmComplete } from "./glm";
import { geminiGenerate } from "./gemini";

export type GenerateSource = "glm" | "gemini" | "none";

export interface GenerateJsonResult {
  json: unknown | null;
  source: GenerateSource;
}

/** Strip ```json ... ``` fences a model may wrap JSON in, then trim. */
function stripFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (fenced ? fenced[1] : trimmed).trim();
}

/** Parse a JSON object from model text, or null. Never throws. */
function tryParseJson(text: string): unknown | null {
  const cleaned = stripFences(text);
  if (!cleaned) return null;
  try {
    return JSON.parse(cleaned);
  } catch {
    // Last resort: grab the outermost {...} block.
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function generateJson(opts: {
  system: string;
  user: string;
}): Promise<GenerateJsonResult> {
  // 1) GLM primary.
  const glm = await glmComplete({ system: opts.system, user: opts.user, json: true });
  if (!glm.mocked) {
    const parsed = tryParseJson(glm.text);
    if (parsed !== null) return { json: parsed, source: "glm" };
  }

  // 2) Gemini fallback (real generation, system kept separate from user input).
  //    One retry covers the rare empty/thoughts-only candidate from 2.5-flash
  //    without burning the free-tier per-minute quota.
  for (let attempt = 0; attempt < 2; attempt++) {
    const gemini = await geminiGenerate({
      prompt: opts.user,
      systemInstruction: opts.system,
      json: true,
    });
    if (gemini.mocked) break;
    const parsed = tryParseJson(gemini.text);
    if (parsed !== null) return { json: parsed, source: "gemini" };
  }

  // 3) Both unavailable.
  return { json: null, source: "none" };
}
