"use client";

import { useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import DateStrip from "@/components/DateStrip";
import { useSymptomLog } from "@/hooks/useSymptomLog";
import { toDateKey, type Bleeding, type SymptomLogEntry } from "@/lib/symptomLog";
import { useT } from "@/components/LangProvider";

const BLEEDING_OPTIONS: Bleeding[] = ["none", "spotting", "moderate", "heavy"];

type FormState = Omit<SymptomLogEntry, "id" | "date">;

const DEFAULT_FORM: FormState = {
  sleep: 3,
  painLocation: "",
  painLevel: 3,
  mood: 3,
  swelling: false,
  swellingLocation: "",
  bleeding: "none",
  fetalMovements: 12,
  note: "",
};

function painColor(v: number) {
  return v >= 7 ? "#dc2626" : v >= 5 ? "#d97706" : "#0d9488";
}

function formatDateKey(key: string) {
  return new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function LogFlow() {
  const t = useT();
  const { entries, ready, upsertEntry, getByDate } = useSymptomLog();

  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  // Load the selected day's entry into the form (latest entries via ref so
  // typing isn't wiped when the store loads/saves).
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  useEffect(() => {
    const existing = entriesRef.current.find((e) => e.date === selectedDate);
    setForm(existing ? { ...existing } : DEFAULT_FORM);
  }, [selectedDate, ready]);

  function handleSave() {
    upsertEntry(selectedDate, form);
    toast.success(t("log.saved"));
  }

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col">
      <div className="px-5 pb-3 pt-6">
        <h1 className="text-2xl font-bold text-foreground">{t("log.title")}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{t("log.subtitle")}</p>
      </div>

      {/* Horizontal calendar */}
      <div className="px-5">
        <DateStrip
          selected={selectedDate}
          onSelect={setSelectedDate}
          hasEntry={(key) => Boolean(getByDate(key))}
        />
      </div>

      {/* Check-in form (expands below for the selected day) */}
      <div className="slide-up px-5 pt-4" key={selectedDate}>
        <div className="mat-card flex flex-col gap-5 p-5">
          <p className="font-semibold text-foreground">
            {t("log.checkinFor", { date: formatDateKey(selectedDate) })}
          </p>

          {/* Sleep */}
          <Field
            label={t("log.sleep")}
            value={`${form.sleep}/5`}
            low={t("log.sleepLow")}
            high={t("log.sleepHigh")}
          >
            <Slider
              min={1}
              max={5}
              step={1}
              value={[form.sleep]}
              onValueChange={([v]) => setForm({ ...form, sleep: v })}
            />
          </Field>

          {/* Pain level */}
          <Field
            label={t("log.pain")}
            value={`${form.painLevel}/10`}
            valueColor={painColor(form.painLevel)}
            low={t("log.painNone")}
            high={t("log.painSevere")}
          >
            <Slider
              min={0}
              max={10}
              step={1}
              value={[form.painLevel]}
              onValueChange={([v]) => setForm({ ...form, painLevel: v })}
            />
          </Field>

          {/* Pain location */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t("log.painLocation")}
            </label>
            <input
              value={form.painLocation}
              onChange={(e) => setForm({ ...form, painLocation: e.target.value })}
              placeholder={t("log.painLocationPlaceholder")}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>

          {/* Mood */}
          <Field
            label={t("log.mood")}
            value={`${form.mood}/5`}
            low={t("log.moodLow")}
            high={t("log.moodHigh")}
          >
            <Slider
              min={1}
              max={5}
              step={1}
              value={[form.mood]}
              onValueChange={([v]) => setForm({ ...form, mood: v })}
            />
          </Field>

          {/* Fetal movements */}
          <div>
            <div className="mb-2 flex justify-between">
              <label className="text-sm font-medium text-foreground">
                {t("log.fetal")}
              </label>
              <span
                className={`text-sm font-semibold ${form.fetalMovements < 10 ? "text-red-600" : "text-teal-700"}`}
              >
                {form.fetalMovements}
              </span>
            </div>
            <Slider
              min={0}
              max={30}
              step={1}
              value={[form.fetalMovements]}
              onValueChange={([v]) => setForm({ ...form, fetalMovements: v })}
            />
            {form.fetalMovements < 10 && (
              <p className="mt-1 text-xs text-red-600">⚠ {t("log.fetalWarn")}</p>
            )}
          </div>

          {/* Bleeding */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t("log.bleeding")}
            </label>
            <div className="flex flex-wrap gap-2">
              {BLEEDING_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm({ ...form, bleeding: opt })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.bleeding === opt
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-border bg-card text-foreground hover:border-teal-400"
                  }`}
                >
                  {t(`log.bleeding.${opt}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Swelling */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t("log.swelling")}
            </label>
            <div className="flex gap-2">
              {[
                { val: false, label: t("log.swellingNo") },
                { val: true, label: t("log.swellingYes") },
              ].map(({ val, label }) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setForm({ ...form, swelling: val })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.swelling === val
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-border bg-card text-foreground hover:border-teal-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {form.swelling && (
              <input
                value={form.swellingLocation}
                onChange={(e) =>
                  setForm({ ...form, swellingLocation: e.target.value })
                }
                placeholder={t("log.swellingLocationPlaceholder")}
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            )}
          </div>

          {/* Note */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t("log.note")}
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder={t("log.notePlaceholder")}
              className="h-16 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
          >
            {t("log.save")}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="flex flex-col gap-3 px-5 pt-6">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-teal-600" />
          <p className="text-sm font-semibold text-foreground">
            {t("log.history")} ({entries.length})
          </p>
        </div>
        {sorted.length === 0 ? (
          <div className="mat-card p-8 text-center">
            <p className="text-sm text-muted-foreground">{t("log.noEntries")}</p>
          </div>
        ) : (
          sorted.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelectedDate(entry.date)}
              className={`mat-card flex items-center justify-between p-3 text-left transition-colors ${
                entry.date === selectedDate ? "ring-2 ring-teal-300" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {formatDateKey(entry.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: painColor(entry.painLevel) }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {t("log.pain")} {entry.painLevel}/10
                  </span>
                </span>
              </div>
              <span className="text-base">
                {entry.mood >= 4 ? "😊" : entry.mood >= 3 ? "😐" : "😔"}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  valueColor,
  low,
  high,
  children,
}: {
  label: string;
  value: string;
  valueColor?: string;
  low: string;
  high: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span
          className="text-sm font-semibold text-teal-700"
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </span>
      </div>
      {children}
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}
