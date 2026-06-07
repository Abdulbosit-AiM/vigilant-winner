// ============================================================
// Symptom log model + seed data. Entries live in localStorage
// (see hooks/useSymptomLog.ts) — never uploaded.
// ============================================================

export type Bleeding = "none" | "spotting" | "moderate" | "heavy";

export interface SymptomLogEntry {
  id: string;
  date: string; // local YYYY-MM-DD
  sleep: number; // 1..5
  painLocation: string;
  painLevel: number; // 0..10
  mood: number; // 1..5
  swelling: boolean;
  swellingLocation: string;
  bleeding: Bleeding;
  fetalMovements: number; // 0..30
  note: string;
}

/** Local YYYY-MM-DD key (avoids UTC off-by-one from toISOString). */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

/**
 * Seven days of seed data ending today, carrying a deliberate pattern so the
 * Patterns screen has something real to detect on first run:
 * pain ≥ 6 on 5 of the last 7 days; low mood on several days.
 */
export function buildSeedEntries(today: Date = new Date()): SymptomLogEntry[] {
  const pain = [5, 6, 7, 7, 4, 6, 7];
  const mood = [3, 3, 2, 2, 3, 2, 2];
  const sleep = [3, 4, 2, 3, 4, 3, 4];
  const movements = [12, 14, 10, 11, 15, 13, 12];
  const swelling = [false, false, true, true, false, false, false];
  const notes = [
    "Felt tired all day. Baby moving well.",
    "Back pain worse in the evening.",
    "Ankles swollen by afternoon. Feeling low.",
    "Pain not improving. Mood still low.",
    "Better day. Swelling gone.",
    "Pain back again. Feeling anxious.",
    "Today's check-in.",
  ];

  const out: SymptomLogEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const idx = 6 - i;
    const d = addDays(today, -i);
    const date = toDateKey(d);
    out.push({
      id: `seed-${date}`,
      date,
      sleep: sleep[idx],
      painLocation: "lower back",
      painLevel: pain[idx],
      mood: mood[idx],
      swelling: swelling[idx],
      swellingLocation: swelling[idx] ? "ankles" : "",
      bleeding: "none",
      fetalMovements: movements[idx],
      note: notes[idx],
    });
  }
  return out;
}
