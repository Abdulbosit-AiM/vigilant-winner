import { describe, expect, it } from "vitest";
import { buildEmergencyCard, DISCLAIMER } from "./emergencyCard";

describe("buildEmergencyCard", () => {
  it("builds a valid static emergency card with no network/model dependency", () => {
    const card = buildEmergencyCard();

    expect(card.type).toBe("emergency");
    expect(card.headline_en.length).toBeGreaterThan(0);
    expect(card.headline_zh.length).toBeGreaterThan(0);
    expect(card.body_en.length).toBeGreaterThan(0);
    expect(card.body_zh.length).toBeGreaterThan(0);

    expect(card.primary.tel).toBe("tel:999");
    expect(card.secondary.tel).toBe("tel:111");
  });

  it("ends with the exact disclaimer literal", () => {
    expect(buildEmergencyCard().disclaimer).toBe(DISCLAIMER);
    expect(DISCLAIMER).toBe(
      "This is not medical advice. Always confirm with your midwife or doctor.",
    );
  });

  it("is deterministic across calls", () => {
    expect(buildEmergencyCard()).toEqual(buildEmergencyCard());
  });
});
