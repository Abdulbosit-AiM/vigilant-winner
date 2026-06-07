export type RedFlagLanguage = "en" | "zh" | "hi" | "ur" | "pl";

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

// Hindi (Devanagari). Same clinical categories as EN/ZH.
// ⚠ Good-faith translations — verify with a native speaker before pitch.
export const RED_FLAG_TERMS_HI: readonly string[] = [
  // Fetal movement
  "बच्चा हिल नहीं रहा",
  "बच्चा नहीं हिल रहा",
  "बच्चे की हलचल कम",
  "हलचल कम हो गई",
  "भ्रूण की हलचल कम",
  "हलचल महसूस नहीं",
  // Pre-eclampsia
  "तेज़ सिरदर्द",
  "तेज सिरदर्द",
  "बहुत सिरदर्द",
  "धुंधला दिख",
  "आंखों के आगे धब्बे",
  "आँखों के आगे धब्बे",
  "पसलियों के नीचे दर्द",
  // Bleeding
  "बहुत खून बह रहा",
  "ज़्यादा खून बह रहा",
  "भारी रक्तस्राव",
  "योनि से खून",
  "खून के थक्के",
  // Waters
  "पानी की थैली फट",
  "पानी निकल रहा",
  "पानी टूट गया",
  // Other emergencies
  "सीने में दर्द",
  "छाती में दर्द",
  "सांस लेने में तकलीफ",
  "साँस लेने में तकलीफ",
  "सांस नहीं ले",
  "बेहोश",
  "दौरा पड़ा",
];

// Urdu (Arabic script). Same clinical categories as EN/ZH.
// ⚠ Good-faith translations — verify with a native speaker before pitch.
export const RED_FLAG_TERMS_UR: readonly string[] = [
  // Fetal movement
  "بچہ حرکت نہیں کر رہا",
  "بچہ ہل نہیں رہا",
  "بچے کی حرکت کم",
  "حرکت کم ہو گئی",
  "حرکت محسوس نہیں",
  // Pre-eclampsia
  "شدید سر درد",
  "بہت سر درد",
  "دھندلا نظر",
  "دھندلا دکھائی",
  "آنکھوں کے سامنے دھبے",
  "پسلیوں کے نیچے درد",
  // Bleeding
  "بہت زیادہ خون",
  "زیادہ خون بہہ رہا",
  "خون کے لوتھڑے",
  "اندام نہانی سے خون",
  // Waters
  "پانی کی تھیلی پھٹ",
  "پانی نکل رہا",
  "پانی ٹوٹ گیا",
  // Other emergencies
  "سینے میں درد",
  "سانس لینے میں دشواری",
  "سانس نہیں آ رہی",
  "بے ہوش",
  "دورہ پڑا",
];

// Polish (lowercase; matching also folds diacritics so "bol glowy" typed
// without Polish keys still matches — see urgencyGate.ts).
// ⚠ Good-faith translations — verify with a native speaker before pitch.
export const RED_FLAG_TERMS_PL: readonly string[] = [
  // Fetal movement
  "dziecko się nie rusza",
  "dziecko sie nie rusza",
  "dziecko mniej się rusza",
  "słabsze ruchy dziecka",
  "brak ruchów dziecka",
  "mniej ruchów płodu",
  "osłabione ruchy płodu",
  "nie czuję ruchów",
  // Pre-eclampsia
  "silny ból głowy",
  "ostry ból głowy",
  "zaburzenia widzenia",
  "niewyraźne widzenie",
  "mroczki przed oczami",
  "ból pod żebrami",
  "silne obrzęki",
  // Bleeding
  "obfite krwawienie",
  "silne krwawienie",
  "mocno krwawię",
  "krwawienie z dróg rodnych",
  "skrzepy krwi",
  // Waters
  "odeszły wody",
  "odejście wód",
  "wody płodowe odeszły",
  "sączenie wód",
  // Other emergencies
  "ból w klatce piersiowej",
  "duszności",
  "nie mogę oddychać",
  "trudności z oddychaniem",
  "utrata przytomności",
  "zemdlałam",
  "drgawki",
];

export const RED_FLAG_TERMS: Record<RedFlagLanguage, readonly string[]> = {
  en: RED_FLAG_TERMS_EN,
  zh: RED_FLAG_TERMS_ZH,
  hi: RED_FLAG_TERMS_HI,
  ur: RED_FLAG_TERMS_UR,
  pl: RED_FLAG_TERMS_PL,
};
