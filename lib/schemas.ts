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
