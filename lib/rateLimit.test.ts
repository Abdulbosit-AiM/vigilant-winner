import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, getClientIp, __resetRateLimit } from "./rateLimit";

describe("rateLimit", () => {
  beforeEach(() => __resetRateLimit());

  it("allows up to the limit, then blocks", () => {
    const key = "1.2.3.4";
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(key, 10).ok).toBe(true);
    }
    const blocked = rateLimit(key, 10);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("counts each IP independently", () => {
    expect(rateLimit("a", 2).ok).toBe(true);
    expect(rateLimit("a", 2).ok).toBe(true);
    expect(rateLimit("a", 2).ok).toBe(false);
    // A different key is unaffected.
    expect(rateLimit("b", 2).ok).toBe(true);
  });

  it("reports decreasing remaining allowance", () => {
    expect(rateLimit("c", 3).remaining).toBe(2);
    expect(rateLimit("c", 3).remaining).toBe(1);
    expect(rateLimit("c", 3).remaining).toBe(0);
  });
});

describe("getClientIp", () => {
  it("takes the first x-forwarded-for entry", () => {
    const req = new Request("https://x", {
      headers: { "x-forwarded-for": "9.9.9.9, 10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("9.9.9.9");
  });

  it("falls back to x-real-ip then 'unknown'", () => {
    expect(getClientIp(new Request("https://x", { headers: { "x-real-ip": "8.8.8.8" } }))).toBe(
      "8.8.8.8",
    );
    expect(getClientIp(new Request("https://x"))).toBe("unknown");
  });
});
