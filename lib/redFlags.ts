export type RedFlagLanguage = "en" | "zh";

// Hardcoded pregnancy red-flag terms (SAFETY-GUARDRAILS.md Appendix A).
// English terms are stored lowercase; matching lowercases the input before comparison.
export const RED_FLAG_TERMS_EN: readonly string[] = [
  // Fetal movement
  "reduced fetal movement",
  "reduced foetal movement",
  "baby not moving",
  "baby hasn't moved",
  "no fetal movement",
  "no foetal movement",
  "fetal movements reduced",
  "foetal movements reduced",
  // Pre-eclampsia
  "severe headache",
  "bad headache",
  "vision changes",
  "blurry vision",
  "seeing spots",
  "visual disturbance",
  "severe swelling",
  "swollen face",
  "pain under ribs",
  "epigastric pain",
  // Bleeding
  "heavy bleeding",
  "heavy vaginal bleeding",
  "blood clots",
  "soaking a pad",
  // Waters
  "waters broken",
  "waters breaking",
  "waters broke",
  "gush of fluid",
  "leaking fluid",
  "rupture of membranes",
  // Other emergencies
  "chest pain",
  "can't breathe",
  "difficulty breathing",
  "unconscious",
  "fitting",
  "seizure",
  "collapse",
];

export const RED_FLAG_TERMS_ZH: readonly string[] = [
  // Fetal movement
  "胎动减少",
  "宝宝不动",
  "没有胎动",
  "胎儿不动",
  // Pre-eclampsia
  "严重头痛",
  "剧烈头痛",
  "视力模糊",
  "视觉变化",
  "眼前发黑",
  // Bleeding / waters
  "大量出血",
  "阴道出血",
  "破水",
  "羊水流出",
  "液体流出",
  // Other
  "胸痛",
  "呼吸困难",
  "晕倒",
  "抽搐",
];

export const RED_FLAG_TERMS: Record<RedFlagLanguage, readonly string[]> = {
  en: RED_FLAG_TERMS_EN,
  zh: RED_FLAG_TERMS_ZH,
};
