"use client";

import { useMemo, useRef, useState } from "react";
import {
  TrendingUp,
  Volume2,
  X,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useSymptomLog } from "@/hooks/useSymptomLog";
import { computeAlerts, chartSeries, type PatternAlert } from "@/lib/patterns";
import { useT } from "@/components/LangProvider";

type AudioState = { id: string; phase: "loading" | "playing" } | null;

export default function PatternsFlow() {
  const t = useT();
  const { entries } = useSymptomLog();

  const alerts = useMemo(() => computeAlerts(entries), [entries]);
  const data = useMemo(() => chartSeries(entries), [entries]);

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = alerts.filter((a) => !dismissed.has(a.id));

  const [audio, setAudio] = useState<AudioState>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function stopAudio() {
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setAudio(null);
  }

  async function play(alert: PatternAlert) {
    if (audio?.id === alert.id) {
      stopAudio();
      return;
    }
    stopAudio();
    setAudio({ id: alert.id, phase: "loading" });
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: alert.englishScript }),
      });
      if (!res.ok) throw new Error("tts unavailable");
      const json = (await res.json()) as { audioBase64Wav?: string };
      if (!json.audioBase64Wav) throw new Error("no audio");
      const el = new Audio(`data:audio/wav;base64,${json.audioBase64Wav}`);
      audioRef.current = el;
      el.onended = () => setAudio(null);
      el.onerror = () => setAudio(null);
      setAudio({ id: alert.id, phase: "playing" });
      await el.play();
    } catch {
      // Web Speech fallback so the Play moment always works.
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(alert.englishScript);
        u.lang = "en-GB";
        u.rate = 0.9;
        u.onend = () => setAudio(null);
        setAudio({ id: alert.id, phase: "playing" });
        window.speechSynthesis.speak(u);
      } else {
        setAudio(null);
        toast.info("Audio playback isn't available on this device.");
      }
    }
  }

  return (
    <div className="flex flex-col">
      <div className="px-5 pb-4 pt-6">
        <h1 className="text-2xl font-bold text-foreground">{t("patterns.title")}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {t("patterns.subtitle")}
        </p>
      </div>

      {/* Alerts */}
      <div className="flex flex-col gap-3 px-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-orange-500" />
          <p className="text-sm font-semibold text-foreground">
            {visible.length === 1
              ? t("patterns.detected", { n: 1 })
              : t("patterns.detectedPlural", { n: visible.length })}
          </p>
        </div>

        {visible.length === 0 && (
          <div className="mat-card p-6 text-center">
            <p className="text-sm text-muted-foreground">{t("patterns.none")}</p>
          </div>
        )}

        {visible.map((alert) => {
          const isUrgent = alert.severity === "urgent";
          const isPlaying = audio?.id === alert.id && audio.phase === "playing";
          const isLoading = audio?.id === alert.id && audio.phase === "loading";
          return (
            <div
              key={alert.id}
              className={`mat-card slide-up overflow-hidden border-l-4 ${
                isUrgent ? "border-l-orange-400" : "border-l-amber-400"
              }`}
            >
              <div className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`h-4 w-4 ${isUrgent ? "text-orange-500" : "text-amber-500"}`}
                    />
                    <p className="text-sm font-bold text-foreground">
                      {t(`patterns.${alert.type}.title`)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDismissed((s) => new Set(s).add(alert.id))
                    }
                    aria-label={t("common.close")}
                    className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-foreground">
                  {t(`patterns.${alert.type}.body`, {
                    count: alert.count,
                    window: alert.windowDays,
                  })}
                </p>

                {/* Midwife script */}
                <div className="mb-3 rounded-xl border border-teal-100 bg-teal-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                      {t("patterns.midwifeScript")}
                    </p>
                    <button
                      type="button"
                      onClick={() => play(alert)}
                      disabled={isLoading}
                      className="flex items-center gap-1 rounded-lg bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-200 active:scale-95 disabled:opacity-60"
                    >
                      <Volume2 className="h-3 w-3" />
                      {isPlaying ? t("patterns.playing") : t("patterns.play")}
                    </button>
                  </div>
                  <p className="text-xs italic leading-relaxed text-teal-900">
                    “{alert.englishScript}”
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {t("patterns.contact")}:
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {alert.contactLabel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {t("patterns.source")}:
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {alert.nhsSource}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="px-5 pt-5">
        <div className="mat-card p-4">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-teal-600" />
            <p className="text-sm font-semibold text-foreground">
              {t("patterns.last7")}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Pain" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Mood" stroke="#0e6b72" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Movements" stroke="#c9923a" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-5 pt-4">
        <p className="border-t border-border pt-4 text-center text-xs leading-relaxed text-muted-foreground">
          ⚠ {t("patterns.disclaimer")}
        </p>
      </div>
    </div>
  );
}
