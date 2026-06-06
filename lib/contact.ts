import type { ExpressModel } from "./schemas";

export type Urgency = ExpressModel["urgency"];
export type ContactType = "999" | "111" | "maternity_triage" | "midwife_team";

export interface ContactMapping {
  contact_type: ContactType;
  contact_label: string;
}

const LABELS: Record<ContactType, string> = {
  "999": "Call 999",
  "111": "Call NHS 111",
  maternity_triage: "Contact your maternity triage line now",
  midwife_team: "Contact your midwife team",
};

/**
 * Urgency → contact mapping (PRD §11.4). The model proposes urgency; this
 * deterministic mapping decides the contact. Conservative default: anything
 * unrecognised or ambiguous escalates UP to maternity triage (never down).
 */
export function mapContact(urgency: string): ContactMapping {
  switch (urgency) {
    case "immediate":
      return { contact_type: "maternity_triage", contact_label: LABELS.maternity_triage };
    case "today":
      return { contact_type: "midwife_team", contact_label: LABELS.midwife_team };
    case "next_appointment":
      return { contact_type: "midwife_team", contact_label: LABELS.midwife_team };
    default:
      // Conservative default — when in doubt, escalate up to maternity triage.
      return { contact_type: "maternity_triage", contact_label: LABELS.maternity_triage };
  }
}
