// ============================================================
// Pattern detection — real, client-side computation over logged
// symptom entries (last 7 days). No model call.
// ============================================================

import { addDays, toDateKey, type SymptomLogEntry } from "@/lib/symptomLog";

export type PatternType = "pain" | "movement" | "mood" | "bleeding";

export interface PatternAlert {
  id: PatternType;
  type: PatternType;
  severity: "warn" | "urgent";
  count: number;
  windowDays: number;
  /** First-person English script to read to the midwife. Always English. */
  englishScript: string;
  nhsSource: string;
  contactLabel: string;
}

const WINDOW = 7;

/** Entries falling within the last `WINDOW` days (today inclusive). */
function recentEntries(entries: SymptomLogEntry[], today: Date): SymptomLogEntry[] {
  const keys = new Set(
    Array.from({ length: WINDOW }, (_, i) => toDateKey(addDays(today, -i))),
  );
  return entries.filter((e) => keys.has(e.date));
}

export function computeAlerts(
  entries: SymptomLogEntry[],
  today: Date = new Date(),
): PatternAlert[] {
  const recent = recentEntries(entries, today);
  const alerts: PatternAlert[] = [];

  // Pain: level >= 6 on multiple days.
  const painDays = recent.filter((e) => e.painLevel >= 6).length;
  if (painDays >= 3) {
    alerts.push({
      id: "pain",
      type: "pain",
      severity: painDays >= 5 ? "urgent" : "warn",
      count: painDays,
      windowDays: WINDOW,
      englishScript: `Over the past week I have logged pain at level 6 or above on ${painDays} days. I would like to discuss this with my midwife and understand whether any further assessment is needed.`,
      nhsSource: "NHS: Back pain in pregnancy",
      contactLabel: painDays >= 5 ? "Midwife — same day" : "Midwife — this week",
    });
  }

  // Reduced fetal movement: fewer than 10 movements logged.
  const lowMovementDays = recent.filter((e) => e.fetalMovements < 10).length;
  if (lowMovementDays >= 1) {
    alerts.push({
      id: "movement",
      type: "movement",
      severity: lowMovementDays >= 2 ? "urgent" : "warn",
      count: lowMovementDays,
      windowDays: WINDOW,
      englishScript:
        "I have noticed reduced fetal movements on more than one day this week. I would like to be assessed as soon as possible.",
      nhsSource: "NHS: Your baby's movements",
      contactLabel: "Maternity triage — now",
    });
  }

  // Low mood: score <= 2 on several days.
  const lowMoodDays = recent.filter((e) => e.mood <= 2).length;
  if (lowMoodDays >= 3) {
    alerts.push({
      id: "mood",
      type: "mood",
      severity: "warn",
      count: lowMoodDays,
      windowDays: WINDOW,
      englishScript:
        "I have been feeling low in mood for several days this week. I would like to discuss how I am feeling and whether I need any additional support during my pregnancy.",
      nhsSource: "NHS: Mental health in pregnancy",
      contactLabel: "GP — this week",
    });
  }

  // Bleeding: any moderate/heavy bleeding.
  const bleedDays = recent.filter(
    (e) => e.bleeding === "moderate" || e.bleeding === "heavy",
  ).length;
  if (bleedDays >= 1) {
    alerts.push({
      id: "bleeding",
      type: "bleeding",
      severity: "urgent",
      count: bleedDays,
      windowDays: WINDOW,
      englishScript:
        "I have logged some vaginal bleeding this week. I would like to be assessed.",
      nhsSource: "NHS: Vaginal bleeding in pregnancy",
      contactLabel: "Maternity triage — now",
    });
  }

  return alerts;
}

/** Last 7 days of entries shaped for the recharts line chart. */
export function chartSeries(
  entries: SymptomLogEntry[],
  today: Date = new Date(),
): { date: string; Pain: number; Mood: number; Movements: number }[] {
  return recentEntries(entries, today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      date: new Date(`${e.date}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      Pain: e.painLevel,
      Mood: e.mood,
      Movements: e.fetalMovements,
    }));
}
