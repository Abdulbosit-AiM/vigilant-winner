import { describe, expect, it } from "vitest";
import { DISCLAIMER } from "./emergencyCard";
import { ExpressModelSchema, ExpressOutputSchema } from "./schemas";

const validModel = {
  urgency: "today",
  urgency_label: "Contact your midwife today",
  explanation_native: "你描述的情况值得今天联系助产士检查。",
  explanation_source: "NHS — Your baby's movements",
  english_script: "I've noticed my baby is moving less today. Can I be checked?",
};

const validOutput = {
  kind: "guidance" as const,
  ...validModel,
  contact_type: "midwife_team" as const,
  contact_label: "Contact your midwife team",
  disclaimer: DISCLAIMER,
};

describe("ExpressModelSchema", () => {
  it("accepts a well-formed model output", () => {
    expect(ExpressModelSchema.safeParse(validModel).success).toBe(true);
  });

  it("rejects an empty explanation_source (rule 4)", () => {
    expect(
      ExpressModelSchema.safeParse({ ...validModel, explanation_source: "" }).success,
    ).toBe(false);
  });

  it("rejects an invalid urgency enum", () => {
    expect(
      ExpressModelSchema.safeParse({ ...validModel, urgency: "whenever" }).success,
    ).toBe(false);
  });
});

describe("ExpressOutputSchema", () => {
  it("accepts a fully-assembled guidance payload", () => {
    expect(ExpressOutputSchema.safeParse(validOutput).success).toBe(true);
  });

  it("rejects a non-literal disclaimer (rule 5)", () => {
    expect(
      ExpressOutputSchema.safeParse({ ...validOutput, disclaimer: "Take care!" }).success,
    ).toBe(false);
  });

  it("rejects a contact_type outside the enum", () => {
    expect(
      ExpressOutputSchema.safeParse({ ...validOutput, contact_type: "gp" }).success,
    ).toBe(false);
  });

  it("strips raw model fields it does not declare", () => {
    const parsed = ExpressOutputSchema.parse({ ...validOutput, injected: "raw" });
    expect("injected" in parsed).toBe(false);
  });
});
