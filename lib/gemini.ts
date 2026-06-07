/**
 * Typed Google Gemini wrappers (Gemini Developer API, REST via fetch — no SDK,
 * to stay resilient to SDK churn during the hackathon).
 *
 * Covers: text/vision generation, embeddings, TTS (separate model), and STT via
 * multimodal generateContent (audio as inline base64 — NOT a Whisper-style ASR
 * endpoint). Every call has a labelled mock fallback (DEMO_SAFE_MODE / no key /
 * live failure).
 */
import { DEMO_SAFE_MODE, env, live } from "./env";

const API_ROOT = "https://generativelanguage.googleapis.com/v1beta";

function url(model: string, method: string): string {
  return `${API_ROOT}/models/${model}:${method}?key=${env.gemini.apiKey}`;
}

interface InlineData {
  mimeType: string;
  /** base64-encoded bytes */
  data: string;
}

async function postJson(endpoint: string, body: unknown): Promise<any> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 200)}`);
  }
  return res.json();
}

/* ----------------------------- text / vision ----------------------------- */

export interface GeminiTextResult {
  text: string;
  mocked: boolean;
}

/**
 * Text (and optionally image) generation. `images` are inline base64 parts.
 * `systemInstruction` is sent as Gemini's top-level system field so the system
 * prompt stays SEPARATE from user input (prompt-injection defence — never
 * interpolate user text into it). `json: true` requests a JSON response body.
 */
export async function geminiGenerate(opts: {
  prompt: string;
  images?: InlineData[];
  systemInstruction?: string;
  json?: boolean;
}): Promise<GeminiTextResult> {
  if (!live.gemini()) {
    return {
      text: `[mock:gemini-text] ${DEMO_SAFE_MODE ? "DEMO_SAFE_MODE" : "no key"} — ${opts.prompt.slice(0, 60)}`,
      mocked: true,
    };
  }
  try {
    const parts: unknown[] = [{ text: opts.prompt }];
    for (const img of opts.images ?? []) {
      parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
    }
    const body: Record<string, unknown> = {
      contents: [{ role: "user", parts }],
    };
    if (opts.systemInstruction) {
      body.systemInstruction = { parts: [{ text: opts.systemInstruction }] };
    }
    if (opts.json) {
      // Disable "thinking" for structured JSON: faster and avoids the
      // occasional thoughts-only (empty text) candidate from 2.5-flash.
      body.generationConfig = {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
      };
    }
    const json = await postJson(url(env.gemini.textModel, "generateContent"), body);
    const text =
      json?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("") ?? "";
    return { text, mocked: false };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    return { text: `[mock:gemini-text] live failed (${reason})`, mocked: true };
  }
}

/* ------------------------------- embeddings ------------------------------- */

export interface EmbedResult {
  vector: number[];
  mocked: boolean;
}

/** Deterministic pseudo-embedding so mock RAG still ranks consistently. */
function mockVector(text: string, dim = 768): number[] {
  const v = new Array(dim).fill(0);
  for (let i = 0; i < text.length; i++) {
    v[i % dim] += text.charCodeAt(i) / 255;
  }
  const norm = Math.hypot(...v) || 1;
  return v.map((x) => x / norm);
}

export async function geminiEmbed(text: string): Promise<EmbedResult> {
  if (!live.gemini()) {
    return { vector: mockVector(text), mocked: true };
  }
  try {
    const json = await postJson(url(env.gemini.embedModel, "embedContent"), {
      model: `models/${env.gemini.embedModel}`,
      content: { parts: [{ text }] },
    });
    const vector: number[] = json?.embedding?.values ?? [];
    return { vector, mocked: false };
  } catch {
    return { vector: mockVector(text), mocked: true };
  }
}

/* ---------------------------------- TTS ----------------------------------- */

export interface TtsResult {
  /** base64-encoded audio (PCM 24kHz from Gemini TTS, or empty when mocked). */
  audioBase64: string;
  mimeType: string;
  mocked: boolean;
}

/** Text-to-speech on the English script (the demo moment). */
export async function geminiTts(opts: {
  text: string;
  voice?: string;
}): Promise<TtsResult> {
  if (!live.gemini()) {
    return { audioBase64: "", mimeType: "audio/L16;rate=24000", mocked: true };
  }
  try {
    const json = await postJson(url(env.gemini.ttsModel, "generateContent"), {
      contents: [{ parts: [{ text: opts.text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: opts.voice ?? "Kore" },
          },
        },
      },
    });
    const inline = json?.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: InlineData }) => p.inlineData,
    )?.inlineData;
    return {
      audioBase64: inline?.data ?? "",
      mimeType: inline?.mimeType ?? "audio/L16;rate=24000",
      mocked: false,
    };
  } catch (err) {
    console.error("geminiTts failed:", err instanceof Error ? err.message : err);
    return { audioBase64: "", mimeType: "audio/L16;rate=24000", mocked: true };
  }
}

/* ---------------------------------- STT ----------------------------------- */

/** Speech-to-text via multimodal generateContent (inline audio base64). */
export async function geminiTranscribe(opts: {
  audioBase64: string;
  mimeType: string;
}): Promise<GeminiTextResult> {
  if (!live.gemini()) {
    return { text: "[mock:gemini-stt] transcript unavailable in mock mode", mocked: true };
  }
  try {
    const json = await postJson(url(env.gemini.textModel, "generateContent"), {
      contents: [
        {
          role: "user",
          parts: [
            { text: "Transcribe this audio. Return only the transcribed text, no commentary." },
            { inlineData: { mimeType: opts.mimeType, data: opts.audioBase64 } },
          ],
        },
      ],
    });
    const text =
      json?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("") ?? "";
    return { text, mocked: false };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    return { text: `[mock:gemini-stt] live failed (${reason})`, mocked: true };
  }
}

/* ---------------------------------- OCR ----------------------------------- */

/**
 * OCR via vision generateContent (inline image base64). Used by /api/ocr to
 * extract NHS-letter text for the Interpret flow. The image is processed
 * in-memory only — callers must never log or persist it.
 */
export async function geminiOcr(opts: {
  imageBase64: string;
  mimeType: string;
}): Promise<GeminiTextResult> {
  if (!live.gemini()) {
    return { text: "[mock:gemini-ocr] extraction unavailable in mock mode", mocked: true };
  }
  try {
    const json = await postJson(url(env.gemini.textModel, "generateContent"), {
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Extract ALL text from this photographed document exactly as written. " +
                "Preserve line breaks. Return only the extracted text — no commentary, " +
                "no translation, no summary. If the image contains no readable text, " +
                "return an empty response.",
            },
            { inlineData: { mimeType: opts.mimeType, data: opts.imageBase64 } },
          ],
        },
      ],
      // Plain extraction — no thinking needed, keeps latency low.
      generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
    });
    const text =
      json?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("") ?? "";
    return { text, mocked: false };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    return { text: `[mock:gemini-ocr] live failed (${reason})`, mocked: true };
  }
}

/** Health probe: synthesizes a short full sentence (single words confuse TTS). */
export async function geminiHealth(): Promise<{ ok: boolean; mocked: boolean; bytes: number }> {
  const r = await geminiTts({ text: "Health check passed." });
  return { ok: r.audioBase64.length > 0, mocked: r.mocked, bytes: r.audioBase64.length };
}
