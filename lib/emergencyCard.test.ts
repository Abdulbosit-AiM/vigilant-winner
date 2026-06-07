import { describe, expect, it } from "vitest";
import { buildEmergencyCard, DISCLAIMER } from "./emergencyCard";
import { LANGS } from "./languages";

describe("buildEmergencyCard", () => {
  it("builds a valid static emergency card with no network/model dependency", () => {
    const card = buildEmergencyCard();

    expect(card.type).toBe("emergency");
    expect(card.en.headline.length).toBeGreaterThan(0);
    expect(card.en.body.length).toBeGreaterThan(0);

    expect(card.primary_tel).toBe("tel:999");
    expect(card.secondary_tel).toBe("tel:111");
  });

  it("carries complete copy for every supported language", () => {
    const card = buildEmergencyCard();
    for (const lang of LANGS) {
      const copy = lang === "en" ? card.en : card.native[lang];
      expect(copy.headline.length).toBeGreaterThan(0);
      expect(copy.body.length).toBeGreaterThan(0);
      expect(copy.maternity_note.length).toBeGreaterThan(0);
      expect(copy.primary_label.length).toBeGreaterThan(0);
      expect(copy.secondary_label.length).toBeGreaterThan(0);
    }
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
