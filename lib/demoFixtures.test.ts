import { describe, expect, it } from "vitest";
import { DISCLAIMER } from "./emergencyCard";
import {
  ExpressOutputSchema,
  InterpretOutputSchema,
  ExpressEmergencySchema,
} from "./schemas";
import {
  loadExpressFixture,
  loadInterpretFixture,
  loadRedflagFixture,
} from "./demoFixtures";

describe("demo fixtures (PRD §11.8)", () => {
  it("express.json validates against ExpressOutputSchema with real content", async () => {
    const fixture = await loadExpressFixture();
    const parsed = ExpressOutputSchema.safeParse(fixture);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.english_script.length).toBeGreaterThan(20);
      expect(parsed.data.explanation_source.length).toBeGreaterThan(0);
      expect(parsed.data.disclaimer).toBe(DISCLAIMER);
    }
  });

  it("interpret.json validates against InterpretOutputSchema with real content", async () => {
    const fixture = await loadInterpretFixture();
    const parsed = InterpretOutputSchema.safeParse(fixture);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.next_steps.length).toBeGreaterThanOrEqual(1);
      expect(parsed.data.next_steps.length).toBeLessThanOrEqual(4);
      expect(parsed.data.questions_en.length).toBeGreaterThanOrEqual(2);
      expect(parsed.data.questions_en.length).toBeLessThanOrEqual(4);
      expect(parsed.data.explanation_source.length).toBeGreaterThan(0);
      expect(parsed.data.disclaimer).toBe(DISCLAIMER);
    }
  });

  it("redflag.json validates against ExpressEmergencySchema with a full card", async () => {
    const fixture = (await loadRedflagFixture()) as Record<string, unknown>;
    const parsed = ExpressEmergencySchema.safeParse(fixture);
    expect(parsed.success).toBe(true);
    const card = fixture.card as Record<string, unknown>;
    expect(card.headline_en).toBeTruthy();
    expect(card.headline_zh).toBeTruthy();
    expect((card.primary as { tel?: string }).tel).toBe("tel:999");
    expect((card.secondary as { tel?: string }).tel).toBe("tel:111");
    expect(card.disclaimer).toBe(DISCLAIMER);
  });

  it("contains no obvious placeholder text", async () => {
    const all = JSON.stringify([
      await loadExpressFixture(),
      await loadInterpretFixture(),
      await loadRedflagFixture(),
    ]);
    expect(all).not.toMatch(/TODO|PLACEHOLDER|lorem ipsum|XXX/i);
  });
});
