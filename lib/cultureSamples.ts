// ============================================================
// Cultural-context sample data (Priority 1 demo content).
// Per-language colloquial expressions that map to a clinical referent.
// The phrase is in the user's language; the literal/clinical/context are in
// English (the referent the NHS midwife needs). Non-English phrases live here
// (data), never in the UI components.
// ============================================================

import type { Lang } from "@/lib/languages";

export interface IdiomSample {
  id: string;
  phrase: string;
  literal: string;
  clinical: string;
  context: string;
  source: string;
}

// Shared English referents for the four demo concepts, keyed by concept id.
const REFERENTS: Record<string, Omit<IdiomSample, "phrase">> = {
  contractions: {
    id: "contractions",
    literal: "My belly keeps tightening in waves",
    clinical: "Uterine contractions / tightenings",
    context:
      "This describes a sensation that in clinical English maps to uterine contractions. A literal translation can be clinically ambiguous.",
    source: "NHS: Signs that labour has begun",
  },
  "pelvic-pressure": {
    id: "pelvic-pressure",
    literal: "It feels like something is pushing down / falling out from below",
    clinical: "Pelvic pressure / heaviness",
    context:
      "An idiomatic description of pelvic heaviness that is confusing if translated literally. The clinical referent is pelvic pressure.",
    source: "NHS: Pelvic pain in pregnancy",
  },
  dizziness: {
    id: "dizziness",
    literal: "My head spins and I can't stand steadily",
    clinical: "Dizziness and postural instability",
    context:
      "A common way to describe vertigo and balance problems. The clinical term is postural dizziness.",
    source: "NHS: Dizziness and fainting in pregnancy",
  },
  appetite: {
    id: "appetite",
    literal: "I have no appetite and don't want to eat anything",
    clinical: "Loss of appetite",
    context:
      "A culturally common way to describe appetite loss. Clinically this is reduced appetite, relevant to nutrition monitoring.",
    source: "NHS: Vomiting and morning sickness in pregnancy",
  },
};

const PHRASES: Record<Lang, Record<string, string>> = {
  en: {
    contractions: "My belly keeps going tight in waves",
    "pelvic-pressure": "It feels like something is pushing down below",
    dizziness: "My head spins and I feel unsteady on my feet",
    appetite: "I've gone off food — I don't feel like eating anything",
  },
  zh: {
    contractions: "肚子发紧，一阵一阵的",
    "pelvic-pressure": "感觉下面有东西要掉出来",
    dizziness: "头晕眼花，站不稳",
    appetite: "胃口不好，什么都不想吃",
  },
  hi: {
    contractions: "पेट बार-बार कसता है, लहरों की तरह",
    "pelvic-pressure": "ऐसा लगता है जैसे नीचे से कुछ बाहर आ रहा है",
    dizziness: "सिर घूमता है, खड़े रहना मुश्किल है",
    appetite: "भूख नहीं लगती, कुछ खाने का मन नहीं करता",
  },
  ur: {
    contractions: "پیٹ بار بار سخت ہوتا ہے، لہروں کی طرح",
    "pelvic-pressure": "ایسا لگتا ہے جیسے نیچے سے کچھ باہر آ رہا ہے",
    dizziness: "سر گھومتا ہے، کھڑا رہنا مشکل ہے",
    appetite: "بھوک نہیں لگتی، کچھ کھانے کو دل نہیں چاہتا",
  },
  pl: {
    contractions: "Brzuch co chwila napina się falami",
    "pelvic-pressure": "Czuję, jakby coś napierało w dół",
    dizziness: "Kręci mi się w głowie i nie mogę ustać na nogach",
    appetite: "Straciłam apetyt — nie mam ochoty nic jeść",
  },
};

const ORDER = ["contractions", "pelvic-pressure", "dizziness", "appetite"];

function buildSamples(lang: Lang): IdiomSample[] {
  return ORDER.map((id) => ({ ...REFERENTS[id], phrase: PHRASES[lang][id] }));
}

export const IDIOM_SAMPLES: Record<Lang, IdiomSample[]> = {
  en: buildSamples("en"),
  zh: buildSamples("zh"),
  hi: buildSamples("hi"),
  ur: buildSamples("ur"),
  pl: buildSamples("pl"),
};

export interface CalibrationSample {
  original: string;
  calibrated: string;
  note: string;
}

export const CALIBRATION_SAMPLES: CalibrationSample[] = [
  {
    original: "I sometimes feel a little uncomfortable, maybe it's nothing…",
    calibrated:
      "I have been experiencing discomfort that I would like to discuss with you. I would appreciate your assessment.",
    note: "Some speakers understate symptoms out of politeness. The calibrated script is direct without being aggressive, appropriate for NHS clinical culture.",
  },
  {
    original: "Sorry to bother you, but I was wondering if it might be possible…",
    calibrated:
      "I would like to ask about my scan results. Can you explain what they mean for my pregnancy?",
    note: "Indirect phrasing common in some cultures is recalibrated to a clear, confident clinical question.",
  },
];
