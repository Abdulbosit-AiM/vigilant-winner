import { z } from "zod";
import { DISCLAIMER } from "./emergencyCard";

export const URGENCY_LEVELS = ["immediate", "today", "next_appointment"] as const;
export const CONTACT_TYPES = ["999", "111", "maternity_triage", "midwife_team"] as const;

export const UrgencySchema = z.enum(URGENCY_LEVELS);
export const ContactTypeSchema = z.enum(CONTACT_TYPES);

const DisclaimerSchema = z.literal(DISCLAIMER);

/**
 * Shape the MODEL is asked to return. Contact + disclaimer are NOT trusted to
 * the model — they are derived deterministically server-side (PRD §11.4), so
 * they are deliberately absent here.
 */
export const ExpressModelSchema = z.object({
  urgency: UrgencySchema,
  urgency_label: z.string().min(1),
  explanation_native: z.string().min(1),
  explanation_source: z.string().min(1),
  english_script: z.string().min(1),
});
export type ExpressModel = z.infer<typeof ExpressModelSchema>;

/**
 * Final validated guidance payload returned to the client (PRD §11.2 /
 * SAFETY-GUARDRAILS Appendix C). `explanation_source` non-empty (rule 4);
 * `disclaimer` is the exact literal (rule 5).
 */
export const ExpressOutputSchema = z.object({
  kind: z.literal("guidance"),
  urgency: UrgencySchema,
  urgency_label: z.string().min(1),
  explanation_native: z.string().min(1),
  explanation_source: z.string().min(1),
  english_script: z.string().min(1),
  contact_type: ContactTypeSchema,
  contact_label: z.string().min(1),
  disclaimer: DisclaimerSchema,
});
export type ExpressOutput = z.infer<typeof ExpressOutputSchema>;

/** Red-flag payload — returned by the gate, never by the model (PRD §11.2). */
export const ExpressEmergencySchema = z.object({
  kind: z.literal("emergency"),
  matched_term: z.string(),
  contact_type: z.enum(["999", "maternity_triage"]),
  card: z.unknown(),
  disclaimer: DisclaimerSchema,
});
export type ExpressEmergency = z.infer<typeof ExpressEmergencySchema>;

/** Safe fallback when generation fails or output fails validation (PRD §11.2). */
export const ExpressFallbackSchema = z.object({
  kind: z.literal("fallback"),
  message: z.string().min(1),
  contact_type: z.literal("midwife_team"),
  disclaimer: DisclaimerSchema,
});
export type ExpressFallback = z.infer<typeof ExpressFallbackSchema>;

export type ExpressResponse = ExpressOutput | ExpressEmergency | ExpressFallback;

/**
 * Shape the MODEL is asked to return for Interpret (PRD §11.3 /
 * SAFETY-GUARDRAILS Appendix C). The disclaimer is added deterministically
 * server-side, so it is deliberately absent here.
 */
export const InterpretModelSchema = z.object({
  document_type: z.string().min(1),
  explanation_native: z.string().min(1),
  explanation_en: z.string().min(1),
  explanation_source: z.string().min(1),
  next_steps: z.array(z.string().min(1)).min(1).max(4),
  questions_en: z.array(z.string().min(1)).min(2).max(4),
});
export type InterpretModel = z.infer<typeof InterpretModelSchema>;

/**
 * Final validated Interpret payload returned to the client (PRD §11.3).
 * `explanation_source` non-empty (rule 4); `disclaimer` is the exact literal
 * (rule 5); `next_steps` 1–4 items; `questions_en` 2–4 items.
 */
export const InterpretOutputSchema = z.object({
  kind: z.literal("interpretation"),
  document_type: z.string().min(1),
  explanation_native: z.string().min(1),
  explanation_en: z.string().min(1),
  explanation_source: z.string().min(1),
  next_steps: z.array(z.string().min(1)).min(1).max(4),
  questions_en: z.array(z.string().min(1)).min(2).max(4),
  disclaimer: DisclaimerSchema,
});
export type InterpretOutput = z.infer<typeof InterpretOutputSchema>;

/** Safe fallback when Interpret generation fails or output fails validation. */
export const InterpretFallbackSchema = z.object({
  kind: z.literal("fallback"),
  message: z.string().min(1),
  disclaimer: DisclaimerSchema,
});
export type InterpretFallback = z.infer<typeof InterpretFallbackSchema>;

export type InterpretResponse =
  | InterpretOutput
  | ExpressEmergency
  | InterpretFallback;

/**
 * Cultural-context resolution (Priority 1). The MODEL returns the resolution
 * fields; the disclaimer is added deterministically server-side.
 */
export const CultureModelSchema = z.object({
  literal: z.string().min(1),
  clinical_referent: z.string().min(1),
  context: z.string().min(1),
  explanation_source: z.string().min(1),
});
export type CultureModel = z.infer<typeof CultureModelSchema>;

/** Final validated Culture payload returned to the client. */
export const CultureOutputSchema = z.object({
  kind: z.literal("culture"),
  idiom: z.string().min(1),
  literal: z.string().min(1),
  clinical_referent: z.string().min(1),
  context: z.string().min(1),
  explanation_source: z.string().min(1),
  disclaimer: DisclaimerSchema,
});
export type CultureOutput = z.infer<typeof CultureOutputSchema>;

/** Safe fallback when Culture generation fails or output fails validation. */
export const CultureFallbackSchema = z.object({
  kind: z.literal("fallback"),
  message: z.string().min(1),
  disclaimer: DisclaimerSchema,
});
export type CultureFallback = z.infer<typeof CultureFallbackSchema>;

export type CultureResponse =
  | CultureOutput
  | ExpressEmergency
  | CultureFallback;
