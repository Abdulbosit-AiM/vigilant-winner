/**
 * In-memory per-IP rate limiter (PRD §7 hardening / BUILD-PLAN M6.5). A sliding
 * window of timestamps per key; 10 requests / 60s by default. Process-local only
 * (no external store) — adequate for the single-instance hackathon deploy. On a
 * serverless cold start the window resets, which fails open (never blocks a real
 * user) and is acceptable for this build.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Seconds until the oldest request leaves the window (only when blocked). */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  max = MAX_REQUESTS,
  windowMs = WINDOW_MS,
): RateLimitResult {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    hits.set(key, recent);
    const retryAfter = Math.ceil((windowMs - (now - recent[0])) / 1000);
    return { ok: false, remaining: 0, retryAfter };
  }

  recent.push(now);
  hits.set(key, recent);
  return { ok: true, remaining: max - recent.length, retryAfter: 0 };
}

/** Best-effort client IP from proxy headers; falls back to a shared bucket. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Test-only: clear all counters. */
export function __resetRateLimit(): void {
  hits.clear();
}
