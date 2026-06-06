export const DISCLAIMER =
  "This is not medical advice. Always confirm with your midwife or doctor." as const;

export interface EmergencyContact {
  tel: string;
  label_en: string;
  label_zh: string;
}

export interface EmergencyCardData {
  type: "emergency";
  headline_en: string;
  headline_zh: string;
  body_en: string;
  body_zh: string;
  maternity_note_en: string;
  maternity_note_zh: string;
  primary: EmergencyContact;
  secondary: EmergencyContact;
  disclaimer: typeof DISCLAIMER;
}

// Static emergency card content (SAFETY-GUARDRAILS.md Appendix B).
// No model text, no reassurance. Built deterministically from constants.
export function buildEmergencyCard(): EmergencyCardData {
  return {
    type: "emergency",
    headline_en: "Call 999 or go to A&E now",
    headline_zh: "请立即拨打 999 或前往急诊室",
    body_en: "Your symptoms need urgent medical attention.",
    body_zh: "您的症状需要紧急医疗护理。",
    maternity_note_en:
      "If this is an urgent pregnancy concern, also call your maternity unit or triage line now — the number is on your maternity notes.",
    maternity_note_zh:
      "如果这是紧急的孕期问题，请立即拨打您的产科病房或分诊电话——号码在您的产检记录上。",
    primary: {
      tel: "tel:999",
      label_en: "Call 999",
      label_zh: "拨打 999",
    },
    secondary: {
      tel: "tel:111",
      label_en: "Or call NHS 111",
      label_zh: "或拨打 NHS 111",
    },
    disclaimer: DISCLAIMER,
  };
}
