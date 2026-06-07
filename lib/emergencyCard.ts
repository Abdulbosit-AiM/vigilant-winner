import type { NativeLang } from "./languages";

export const DISCLAIMER =
  "This is not medical advice. Always confirm with your midwife or doctor." as const;

/** One language's copy for the static emergency card. */
export interface EmergencyCardCopy {
  headline: string;
  body: string;
  maternity_note: string;
  primary_label: string;
  secondary_label: string;
}

export interface EmergencyCardData {
  type: "emergency";
  en: EmergencyCardCopy;
  /** Record<NativeLang, …> — a missing language is a compile error, not a gap. */
  native: Record<NativeLang, EmergencyCardCopy>;
  primary_tel: string;
  secondary_tel: string;
  disclaimer: typeof DISCLAIMER;
}

// Static emergency card content (SAFETY-GUARDRAILS.md Appendix B).
// No model text, no reassurance. Built deterministically from constants.
// ⚠ hi/ur/pl copy is a good-faith translation — verify with a native speaker.
export function buildEmergencyCard(): EmergencyCardData {
  return {
    type: "emergency",
    en: {
      headline: "Call 999 or go to A&E now",
      body: "Your symptoms need urgent medical attention.",
      maternity_note:
        "If this is an urgent pregnancy concern, also call your maternity unit or triage line now — the number is on your maternity notes.",
      primary_label: "Call 999",
      secondary_label: "Or call NHS 111",
    },
    native: {
      zh: {
        headline: "请立即拨打 999 或前往急诊室",
        body: "您的症状需要紧急医疗护理。",
        maternity_note:
          "如果这是紧急的孕期问题，请立即拨打您的产科病房或分诊电话——号码在您的产检记录上。",
        primary_label: "拨打 999",
        secondary_label: "或拨打 NHS 111",
      },
      hi: {
        headline: "अभी 999 पर कॉल करें या A&E जाएँ",
        body: "आपके लक्षणों के लिए तुरंत चिकित्सा सहायता ज़रूरी है।",
        maternity_note:
          "अगर यह गर्भावस्था से जुड़ी आपात स्थिति है, तो अभी अपनी मैटरनिटी यूनिट या ट्राइएज लाइन पर भी कॉल करें — नंबर आपके मैटरनिटी नोट्स पर है।",
        primary_label: "999 पर कॉल करें",
        secondary_label: "या NHS 111 पर कॉल करें",
      },
      ur: {
        headline: "ابھی 999 پر کال کریں یا A&E جائیں",
        body: "آپ کی علامات کو فوری طبی توجہ کی ضرورت ہے۔",
        maternity_note:
          "اگر یہ حمل سے متعلق ہنگامی صورتحال ہے تو ابھی اپنی میٹرنٹی یونٹ یا ٹرائیج لائن پر بھی کال کریں — نمبر آپ کے میٹرنٹی نوٹس پر ہے۔",
        primary_label: "999 پر کال کریں",
        secondary_label: "یا NHS 111 پر کال کریں",
      },
      pl: {
        headline: "Zadzwoń pod 999 lub jedź na SOR (A&E) teraz",
        body: "Twoje objawy wymagają pilnej pomocy medycznej.",
        maternity_note:
          "Jeśli to pilny problem związany z ciążą, zadzwoń też teraz na swój oddział położniczy lub linię triage — numer znajdziesz w swojej dokumentacji ciążowej.",
        primary_label: "Zadzwoń pod 999",
        secondary_label: "Lub zadzwoń pod NHS 111",
      },
    },
    primary_tel: "tel:999",
    secondary_tel: "tel:111",
    disclaimer: DISCLAIMER,
  };
}
