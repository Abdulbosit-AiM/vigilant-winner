// ============================================================
// Cultural-context sample data (Priority 1 demo content).
// Mandarin is the primary example; other languages can be added as
// hardcoded samples. Non-English phrases live here (data), never in the UI.
// ============================================================

export interface IdiomSample {
  id: string;
  phrase: string;
  literal: string;
  clinical: string;
  context: string;
  source: string;
}

export const IDIOM_SAMPLES: IdiomSample[] = [
  {
    id: "contractions",
    phrase: "肚子发紧，一阵一阵的",
    literal: "Stomach feels tight, in waves",
    clinical: "Uterine contractions / tightenings",
    context:
      "This Mandarin phrase describes a sensation that in clinical English maps to uterine contractions. A literal translation would be clinically ambiguous.",
    source: "NHS: Signs that labour has begun",
  },
  {
    id: "pelvic-pressure",
    phrase: "感觉下面有东西要掉出来",
    literal: "Feels like something is falling out from below",
    clinical: "Pelvic pressure / heaviness",
    context:
      "This idiomatic description of pelvic heaviness would be confusing if translated literally. The clinical referent is pelvic pressure.",
    source: "NHS: Pelvic pain in pregnancy",
  },
  {
    id: "dizziness",
    phrase: "头晕眼花，站不稳",
    literal: "Head spinning, eyes blurring, can't stand steadily",
    clinical: "Dizziness and postural instability",
    context:
      "A common Mandarin compound phrase for vertigo and balance issues. The clinical term is postural dizziness.",
    source: "NHS: Dizziness and fainting in pregnancy",
  },
  {
    id: "appetite",
    phrase: "胃口不好，什么都不想吃",
    literal: "Appetite not good, don't want to eat anything",
    clinical: "Loss of appetite",
    context:
      "A culturally common way to describe appetite loss. In a clinical context this maps to reduced appetite, potentially relevant to nutrition monitoring.",
    source: "NHS: Vomiting and morning sickness in pregnancy",
  },
];

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
