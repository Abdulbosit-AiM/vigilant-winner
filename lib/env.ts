/**
 * Central env access + boot validation.
 *
 * Required keys fail loud (clear message) UNLESS DEMO_SAFE_MODE is on, in which
 * case the app runs on mock clients so a missing key never blocks the demo.
 */

function read(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

export const DEMO_SAFE_MODE = read("DEMO_SAFE_MODE") === "true";

export const env = {
  glm: {
    apiKey: read("GLM_API_KEY"),
    baseUrl: read("GLM_BASE_URL") ?? "https://api.z.ai/api/paas/v4",
    model: read("GLM_MODEL") ?? "glm-5.1",
  },
  gemini: {
    apiKey: read("GEMINI_API_KEY"),
    textModel: read("GEMINI_TEXT_MODEL") ?? "gemini-2.5-flash",
    embedModel: read("GEMINI_EMBED_MODEL") ?? "gemini-embedding-001",
    ttsModel: read("GEMINI_TTS_MODEL") ?? "gemini-2.5-flash-preview-tts",
  },
  supabase: {
    url: read("SUPABASE_URL"),
    // Accept either the new publishable key or the legacy anon key name.
    key: read("SUPABASE_PUBLISHABLE_KEY") ?? read("SUPABASE_ANON_KEY"),
  },
};

/** True when a provider can make live calls. */
export const live = {
  glm: () => !DEMO_SAFE_MODE && Boolean(env.glm.apiKey),
  gemini: () => !DEMO_SAFE_MODE && Boolean(env.gemini.apiKey),
  supabase: () => Boolean(env.supabase.url && env.supabase.key),
};

/**
 * Validate at boot. In DEMO_SAFE_MODE missing keys are warnings, not errors.
 * Returns the list of problems (empty = all good).
 */
export function validateEnv(): string[] {
  const problems: string[] = [];
  const requireKey = (ok: boolean, msg: string) => {
    if (!ok) problems.push(msg);
  };

  if (!DEMO_SAFE_MODE) {
    requireKey(Boolean(env.glm.apiKey), "GLM_API_KEY is missing");
    requireKey(Boolean(env.gemini.apiKey), "GEMINI_API_KEY is missing");
  }
  // Supabase is needed for events/corpus regardless of demo mode, but never the
  // service-role key in client code (we only ever read the publishable key).
  requireKey(
    Boolean(env.supabase.url),
    "SUPABASE_URL is missing",
  );
  requireKey(
    Boolean(env.supabase.key),
    "SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY) is missing",
  );

  return problems;
}
