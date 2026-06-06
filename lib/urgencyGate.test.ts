import { describe, expect, it } from "vitest";
import { detectRedFlag } from "./urgencyGate";

describe("detectRedFlag", () => {
  it("flags reduced fetal movement (EN)", () => {
    const result = detectRedFlag("reduced fetal movement");
    expect(result.hit).toBe(true);
    expect(result.term).toBe("reduced fetal movement");
  });

  it("flags severe headache with blurry vision (EN)", () => {
    expect(detectRedFlag("severe headache and blurry vision").hit).toBe(true);
  });

  it("flags reduced fetal movement (Mandarin 胎动减少)", () => {
    const result = detectRedFlag("胎动减少");
    expect(result.hit).toBe(true);
    expect(result.term).toBe("胎动减少");
  });

  it("flags vaginal bleeding (Mandarin 阴道出血)", () => {
    expect(detectRedFlag("我有阴道出血").hit).toBe(true);
  });

  it("flags severe headache (Mandarin 严重头痛)", () => {
    expect(detectRedFlag("我有严重头痛").hit).toBe(true);
  });

  it("is case-insensitive for English terms", () => {
    expect(detectRedFlag("I have CHEST PAIN right now").hit).toBe(true);
  });

  it("detects a term embedded in a longer English sentence", () => {
    expect(detectRedFlag("since this morning my waters broke at home").hit).toBe(true);
  });

  it("does not flag a benign English symptom", () => {
    const result = detectRedFlag("mild back pain");
    expect(result.hit).toBe(false);
    expect(result.term).toBeUndefined();
  });

  it("does not flag benign Mandarin text", () => {
    expect(detectRedFlag("我有点轻微背痛").hit).toBe(false);
  });

  it("returns no hit for empty input", () => {
    expect(detectRedFlag("").hit).toBe(false);
  });
});
