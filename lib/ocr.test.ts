import { describe, expect, it } from "vitest";
import { assessOcrText, MIN_OCR_CHARS } from "./ocr";

describe("assessOcrText", () => {
  it("accepts a realistic letter extraction and normalises whitespace", () => {
    const raw =
      "Dear Ms Chen,\r\n\r\n\r\nYour combined screening result: the chance of Down's syndrome is 1 in 85.   \nPlease contact the screening team to discuss next steps.";
    const a = assessOcrText(raw);
    expect(a.ok).toBe(true);
    expect(a.text).toContain("1 in 85");
    expect(a.text).not.toContain("\r");
    expect(a.text).not.toMatch(/\n{3,}/);
    expect(a.text).not.toMatch(/[ \t]+\n/);
  });

  it("accepts CJK content (meaningful-character count is script-agnostic)", () => {
    const a = assessOcrText("您的产前筛查结果显示唐氏综合征的概率为八十五分之一，请联系筛查团队。");
    expect(a.ok).toBe(true);
  });

  it("rejects an empty extraction", () => {
    const a = assessOcrText("   \n\n  ");
    expect(a).toEqual({ ok: false, text: "", reason: "empty" });
  });

  it("rejects extractions below the minimum meaningful-character count", () => {
    const a = assessOcrText("NHS 111");
    expect(a.ok).toBe(false);
    expect(a.reason).toBe("too_short");
  });

  it("rejects punctuation/noise even when the raw string is long", () => {
    const noise = "·•—|/\\~^¨´`'\",.;:!?()[]{}<>*#%&@ ".repeat(5);
    const a = assessOcrText(noise);
    expect(a.ok).toBe(false);
    expect(a.reason).toBe("too_short");
  });

  it("rejects mock-prefixed (quota/offline) results", () => {
    const a = assessOcrText("[mock:gemini-ocr] extraction unavailable in mock mode");
    expect(a).toEqual({ ok: false, text: "", reason: "mocked" });
  });

  it("boundary: exactly MIN_OCR_CHARS meaningful characters passes", () => {
    const a = assessOcrText("x".repeat(MIN_OCR_CHARS));
    expect(a.ok).toBe(true);
  });
});
