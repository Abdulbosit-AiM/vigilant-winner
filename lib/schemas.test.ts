import { describe, expect, it } from "vitest";
import { DISCLAIMER } from "./emergencyCard";
import {
  ExpressModelSchema,
  ExpressOutputSchema,
  InterpretModelSchema,
  InterpretOutputSchema,
} from "./schemas";

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

const validInterpretModel = {
  document_type: "first-trimester screening result",
  explanation_native: "这封信说明了您的早孕期筛查结果，并建议下一步联系助产士。",
  explanation_en:
    "This letter explains your first-trimester screening result and suggests talking it through with your midwife.",
  explanation_source: "NHS — Screening tests in pregnancy",
  next_steps: ["Contact your midwife to discuss the result."],
  questions_en: [
    "Can you explain what this result means for me?",
    "What are my options from here?",
  ],
};

const validInterpretOutput = {
  kind: "interpretation" as const,
  ...validInterpretModel,
  disclaimer: DISCLAIMER,
};

describe("InterpretModelSchema", () => {
  it("accepts a well-formed model output", () => {
    expect(InterpretModelSchema.safeParse(validInterpretModel).success).toBe(true);
  });

  it("rejects an empty explanation_source (rule 4)", () => {
    expect(
      InterpretModelSchema.safeParse({ ...validInterpretModel, explanation_source: "" })
        .success,
    ).toBe(false);
  });

  it("rejects fewer than 1 next_step", () => {
    expect(
      InterpretModelSchema.safeParse({ ...validInterpretModel, next_steps: [] }).success,
    ).toBe(false);
  });

  it("rejects more than 4 next_steps", () => {
    expect(
      InterpretModelSchema.safeParse({
        ...validInterpretModel,
        next_steps: ["a", "b", "c", "d", "e"],
      }).success,
    ).toBe(false);
  });

  it("rejects fewer than 2 questions_en", () => {
    expect(
      InterpretModelSchema.safeParse({
        ...validInterpretModel,
        questions_en: ["only one question?"],
      }).success,
    ).toBe(false);
  });

  it("rejects more than 4 questions_en", () => {
    expect(
      InterpretModelSchema.safeParse({
        ...validInterpretModel,
        questions_en: ["a?", "b?", "c?", "d?", "e?"],
      }).success,
    ).toBe(false);
  });
});

describe("InterpretOutputSchema", () => {
  it("accepts a fully-assembled interpretation payload", () => {
    expect(InterpretOutputSchema.safeParse(validInterpretOutput).success).toBe(true);
  });

  it("rejects a non-literal disclaimer (rule 5)", () => {
    expect(
      InterpretOutputSchema.safeParse({ ...validInterpretOutput, disclaimer: "Take care!" })
        .success,
    ).toBe(false);
  });

  it("strips raw model fields it does not declare", () => {
    const parsed = InterpretOutputSchema.parse({ ...validInterpretOutput, injected: "raw" });
    expect("injected" in parsed).toBe(false);
  });
});
