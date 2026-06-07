"use client";

import { useState } from "react";
import { Languages, ArrowRight, Loader2, Sparkles } from "lucide-react";
import EmergencyCard from "@/components/EmergencyCard";
import { Badge } from "@/components/ui/badge";
import type { EmergencyCardData } from "@/lib/emergencyCard";
import {
  IDIOM_SAMPLES,
  CALIBRATION_SAMPLES,
  type IdiomSample,
} from "@/lib/cultureSamples";
import { useLang } from "@/components/LangProvider";

interface Resolution {
  idiom: string;
  literal: string;
  clinical_referent: string;
  context: string;
  explanation_source: string;
}

function fromSample(s: IdiomSample): Resolution {
  return {
    idiom: s.phrase,
    literal: s.literal,
    clinical_referent: s.clinical,
    context: s.context,
    explanation_source: s.source,
  };
}

export default function CultureFlow() {
  const { lang, t } = useLang();
  const samples = IDIOM_SAMPLES[lang] ?? IDIOM_SAMPLES.en;

  const [input, setInput] = useState("");
  const [result, setResult] = useState<Resolution | null>(null);
  const [emergency, setEmergency] = useState<EmergencyCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);

  async function resolve(phrase: string, known?: IdiomSample) {
    const text = phrase.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(false);
    setResult(null);
    setEmergency(null);
    try {
      const res = await fetch("/api/culture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      const data = (await res.json().catch(() => null)) as
        | (Resolution & { kind?: string })
        | { kind: string; card?: EmergencyCardData }
        | null;

      if (data && "kind" in data && data.kind === "culture") {
        setResult(data as Resolution);
      } else if (data && "kind" in data && data.kind === "emergency") {
        setEmergency((data as { card?: EmergencyCardData }).card ?? null);
      } else if (known) {
        setResult(fromSample(known));
      } else {
        setError(true);
      }
    } catch {
      if (known) setResult(fromSample(known));
      else setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (emergency) {
    return (
      <div className="px-5 py-6">
        <EmergencyCard card={emergency} lang={lang} />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="px-5 pb-4 pt-6">
        <h1 className="text-2xl font-bold text-foreground">{t("culture.title")}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{t("culture.subtitle")}</p>
      </div>

      {/* Explainer */}
      <div className="px-5">
        <div className="mat-card-teal p-4">
          <div className="flex items-start gap-3">
            <Languages className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-700" />
            <div>
              <p className="mb-1 text-sm font-semibold text-teal-900">
                {t("culture.whatThis")}
              </p>
              <p className="text-xs leading-relaxed text-teal-800">
                {t("culture.whatThisBody")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Idiom resolution */}
      <div className="px-5 pt-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-600" />
          <p className="text-sm font-semibold text-foreground">
            {t("culture.examplesLabel")}
          </p>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">{t("culture.examplesHint")}</p>

        <div className="mb-4 flex flex-col gap-2">
          {samples.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => {
                setInput(ex.phrase);
                setActiveId(ex.id);
                void resolve(ex.phrase, ex);
              }}
              className={`mat-card border p-3 text-left transition-all active:scale-[0.98] ${
                activeId === ex.id
                  ? "border-teal-400 bg-teal-50"
                  : "border-transparent hover:border-teal-200"
              }`}
            >
              <p className="font-semibold text-foreground">{ex.phrase}</p>
              <p className="mt-0.5 text-xs italic text-muted-foreground">“{ex.literal}”</p>
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex flex-col gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("culture.customPlaceholder")}
            dir="auto"
            rows={2}
            className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm text-foreground focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
          <button
            type="button"
            onClick={() => {
              setActiveId(null);
              void resolve(input);
            }}
            disabled={loading || !input.trim()}
            className="w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {loading ? t("culture.resolving") : t("culture.resolve")}
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
          </div>
        )}

        {error && !loading && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            {t("culture.error")}
          </p>
        )}

        {result && !loading && (
          <div className="mat-card slide-up mt-4 border-l-4 border-l-teal-500 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-teal-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("culture.clinicalReferent")}
              </p>
            </div>
            <p className="mb-2 text-base font-bold text-teal-900">
              {result.clinical_referent}
            </p>
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("culture.literal")}
              </p>
              <p className="text-sm italic text-foreground">“{result.literal}”</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{result.context}</p>
            <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">{t("culture.source")}:</span>
              <Badge variant="outline" className="text-xs">
                {result.explanation_source}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Communication calibration */}
      <div className="px-5 pt-5">
        <button
          type="button"
          className="mat-card flex w-full items-center justify-between p-4"
          onClick={() => setShowCalibration((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-teal-600" />
            <p className="text-sm font-semibold text-foreground">
              {t("culture.calibrationTitle")}
            </p>
          </div>
          <ArrowRight
            className={`h-4 w-4 text-muted-foreground transition-transform ${showCalibration ? "rotate-90" : ""}`}
          />
        </button>

        {showCalibration && (
          <div className="slide-up mt-3 flex flex-col gap-4">
            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              {t("culture.calibrationHint")}
            </p>
            {CALIBRATION_SAMPLES.map((ex, i) => (
              <div key={i} className="mat-card p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("culture.original")}
                </p>
                <p className="text-sm italic text-muted-foreground">“{ex.original}”</p>
                <div className="my-2 flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <ArrowRight className="h-4 w-4 text-teal-500" />
                  <div className="h-px flex-1 bg-border" />
                </div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
                  {t("culture.calibrated")}
                </p>
                <p className="text-sm font-medium text-foreground">“{ex.calibrated}”</p>
                <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                  {ex.note}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="px-5 pt-5">
        <p className="border-t border-border pt-4 text-center text-xs leading-relaxed text-muted-foreground">
          ⚠ {t("culture.disclaimer")}
        </p>
      </div>
    </div>
  );
}
