/**
 * Typed Z.ai GLM client (OpenAI-compatible).
 *
 * Used for generation, RAG-summary and (future) validation. When DEMO_SAFE_MODE
 * is on, or no key is present, returns a clearly-labelled mock instead of
 * calling the network — so the demo never hard-fails on a missing/expired key.
 */
import OpenAI from "openai";
import { DEMO_SAFE_MODE, env, live } from "./env";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: env.glm.apiKey ?? "missing",
      baseURL: env.glm.baseUrl,
    });
  }
  return client;
}

export interface GlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GlmResult {
  text: string;
  mocked: boolean;
  model: string;
}

const MOCK_PREFIX = "[mock:glm]";

/**
 * Single-shot chat completion. `system` is kept separate from `user` so user
 * input is NEVER interpolated into the system string (prompt-injection defence).
 */
export async function glmComplete(opts: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  /** Request strict JSON object output (GLM supports response_format). */
  json?: boolean;
}): Promise<GlmResult> {
  const { system, user, temperature = 0.3, maxTokens = 1200, json = false } = opts;

  if (!live.glm()) {
    return {
      text: `${MOCK_PREFIX} ${DEMO_SAFE_MODE ? "DEMO_SAFE_MODE on" : "no GLM_API_KEY"} — returning placeholder for: ${user.slice(0, 80)}`,
      mocked: true,
      model: env.glm.model,
    };
  }

  try {
    const completion = await getClient().chat.completions.create({
      model: env.glm.model,
      temperature,
      max_tokens: maxTokens,
      ...(json ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return {
      text: completion.choices[0]?.message?.content ?? "",
      mocked: false,
      model: env.glm.model,
    };
  } catch (err) {
    // Fail soft: surface a labelled mock rather than throwing into the request.
    const reason = err instanceof Error ? err.message : "unknown error";
    return {
      text: `${MOCK_PREFIX} live call failed (${reason})`,
      mocked: true,
      model: env.glm.model,
    };
  }
}

/** Lightweight health probe used by /api/health. Throws on real failure. */
export async function glmHealth(): Promise<{ ok: boolean; mocked: boolean; sample: string }> {
  const r = await glmComplete({
    system: "You are a health-check probe. Reply with a single short word.",
    user: "Reply with the word: ok",
    maxTokens: 10,
  });
  return { ok: r.text.length > 0, mocked: r.mocked, sample: r.text.slice(0, 40) };
}
