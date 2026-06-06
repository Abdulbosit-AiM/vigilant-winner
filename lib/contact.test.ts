import { describe, expect, it } from "vitest";
import { mapContact } from "./contact";

describe("mapContact (PRD §11.4)", () => {
  it("maps immediate → maternity_triage", () => {
    expect(mapContact("immediate").contact_type).toBe("maternity_triage");
  });

  it("maps today → midwife_team", () => {
    expect(mapContact("today").contact_type).toBe("midwife_team");
  });

  it("maps next_appointment → midwife_team", () => {
    expect(mapContact("next_appointment").contact_type).toBe("midwife_team");
  });

  it("conservative default: unknown urgency escalates up to maternity_triage", () => {
    expect(mapContact("definitely-not-a-level").contact_type).toBe("maternity_triage");
  });

  it("always returns a non-empty label", () => {
    expect(mapContact("today").contact_label.length).toBeGreaterThan(0);
  });
});
