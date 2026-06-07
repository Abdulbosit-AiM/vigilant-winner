"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, Mic, Square, RotateCcw } from "lucide-react";
import EmergencyCard from "@/components/EmergencyCard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { EmergencyCardData } from "@/lib/emergencyCard";
import { blobToWavBase64 } from "@/lib/audioClient";
import { useLang } from "@/components/LangProvider";

/** Static fallback so the Play moment never depends on a live call (PRD §11.8). */
const DEMO_AUDIO_URL = "/demo/express-script.wav";

type TtsState = "idle" | "loading" | "playing";
type MicState = "idle" | "recording" | "transcribing";

interface GuidanceResponse {
  kind: "guidance";
  urgency: "immediate" | "today" | "next_appointment";
  urgency_label: string;
  explanation_native: string;
  explanation_source: string;
  english_script: string;
  contact_type: string;
  contact_label: string;
  disclaimer: string;
  source?: "glm" | "gemini" | "none";
  offline?: boolean;
}

interface EmergencyResponse {
  kind: "emergency";
  matched_term: string;
  contact_type: string;
  card: EmergencyCardData;
  disclaimer: string;
}

interface FallbackResponse {
  kind: "fallback";
  message: string;
  contact_type: string;
  disclaimer: string;
}

type ExpressResponse = GuidanceResponse | EmergencyResponse | FallbackResponse;

const URGENCY_STYLES: Record<
  GuidanceResponse["urgency"],
  { bar: string; chip: string; icon: string }
> = {
  immediate: { bar: "border-l-urgent", chip: "bg-urgent text-white", icon: "!" },
  today: { bar: "border-l-soon", chip: "bg-soon text-white", icon: "▲" },
  next_appointment: { bar: "border-l-routine", chip: "bg-routine text-white", icon: "✓" },
};

export default function ExpressFlow() {
  const { lang, dir, t } = useLang();
  const rtl = dir === "rtl";

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExpressResponse | null>(null);
  const [error, setError] = useState(false);

  const [ttsState, setTtsState] = useState<TtsState>("idle");
  const [usedDemoAudio, setUsedDemoAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [micSupported, setMicSupported] = useState(false);
  const [micState, setMicState] = useState<MicState>("idle");
  const [sttError, setSttError] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setMicSupported(
      typeof navigator !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof window !== "undefined" &&
        typeof window.MediaRecorder !== "undefined",
    );
  }, []);

  function playUrl(src: string, demo: boolean) {
    audioRef.current?.pause();
    const audio = new Audio(src);
    audioRef.current = audio;
    setUsedDemoAudio(demo);
    audio.onended = () => setTtsState("idle");
    audio.onerror = () => setTtsState("idle");
    setTtsState("playing");
    void audio.play().catch(() => setTtsState("idle"));
  }

  async function playScript(script: string) {
    if (ttsState !== "idle") {
      audioRef.current?.pause();
      setTtsState("idle");
      return;
    }
    setTtsState("loading");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script }),
      });
      if (!res.ok) throw new Error("tts unavailable");
      const data = (await res.json()) as { audioBase64Wav?: string };
      if (!data.audioBase64Wav) throw new Error("no audio");
      playUrl(`data:audio/wav;base64,${data.audioBase64Wav}`, false);
    } catch {
      playUrl(DEMO_AUDIO_URL, true);
    }
  }

  async function toggleMic() {
    if (micState === "recording") {
      recorderRef.current?.stop();
      return;
    }
    if (micState !== "idle") return;
    setSttError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setMicState("transcribing");
        try {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          const audioBase64 = await blobToWavBase64(blob);
          const res = await fetch("/api/stt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioBase64, mimeType: "audio/wav" }),
          });
          if (!res.ok) throw new Error("stt unavailable");
          const data = (await res.json()) as { text?: string };
          if (data.text?.trim()) setText(data.text.trim());
          else throw new Error("empty transcript");
        } catch {
          setSttError(true);
        } finally {
          setMicState("idle");
        }
      };
      recorder.start();
      setMicState("recording");
    } catch {
      setMicState("idle");
      setSttError(true);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(false);
    setResult(null);
    try {
      const res = await fetch("/api/express", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang, source: "text" }),
      });
      const data = (await res.json()) as ExpressResponse;
      setResult(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    audioRef.current?.pause();
    setTtsState("idle");
    setUsedDemoAudio(false);
    setSttError(false);
    setResult(null);
    setText("");
    setError(false);
  }

  if (result?.kind === "emergency") {
    return <EmergencyCard card={result.card} lang={lang} />;
  }

  return (
    <section className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-foreground" dir={rtl ? "rtl" : undefined}>
          {t("express.title")}
        </h2>
        <LanguageSwitcher />
      </div>

      <p className="text-sm text-muted-foreground" dir={rtl ? "rtl" : undefined}>
        {t("express.subtitle")}
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("express.placeholder")}
          dir="auto"
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-card p-3 text-base text-foreground focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />
        {micSupported && (
          <button
            type="button"
            onClick={toggleMic}
            disabled={micState === "transcribing"}
            aria-pressed={micState === "recording"}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
              micState === "recording"
                ? "border-urgent bg-red-50 text-urgent"
                : "border-border text-foreground hover:border-teal-400"
            }`}
          >
            {micState === "recording" ? (
              <Square className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            {micState === "recording"
              ? t("express.recording")
              : micState === "transcribing"
                ? t("express.transcribing")
                : t("express.mic")}
          </button>
        )}
        {sttError && (
          <p className="rounded-lg bg-amber-50 p-2 text-center text-xs text-amber-700">
            {t("express.sttFailed")}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full rounded-xl bg-teal-600 px-4 py-3 text-base font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {loading ? t("express.loading") : t("express.submit")}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">{t("express.privacy")}</p>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-urgent">{t("express.error")}</p>
      )}

      {result?.kind === "guidance" && (
        <article
          className={`mat-card slide-up space-y-4 border-l-4 p-4 ${URGENCY_STYLES[result.urgency].bar}`}
        >
          {result.offline && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              <span aria-hidden="true">●</span>
              {t("express.offline")}
            </p>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("express.urgencyHeading")}
            </p>
            <span
              className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${URGENCY_STYLES[result.urgency].chip}`}
            >
              <span aria-hidden="true">{URGENCY_STYLES[result.urgency].icon}</span>
              {result.urgency_label}
            </span>
          </div>

          <p
            className="whitespace-pre-line text-base leading-relaxed text-foreground"
            dir="auto"
          >
            {result.explanation_native}
          </p>

          <div className="rounded-xl bg-teal-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              {t("express.scriptHeading")}
            </p>
            <p className="mt-1 text-base font-medium text-foreground">
              {result.english_script}
            </p>
            <button
              type="button"
              onClick={() => playScript(result.english_script)}
              disabled={ttsState === "loading"}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <Volume2 className="h-4 w-4" />
              {ttsState === "loading"
                ? t("express.preparingAudio")
                : ttsState === "playing"
                  ? t("express.playing")
                  : t("express.play")}
            </button>
            {usedDemoAudio && (
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                {t("express.demoLabel")}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("express.contactHeading")}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {result.contact_label}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">{t("express.sourceHeading")}:</span>{" "}
            {result.explanation_source}
          </p>

          {!result.offline && result.source && result.source !== "none" && (
            <p className="text-[11px] text-muted-foreground">
              {result.source === "gemini" ? t("express.genGemini") : t("express.genGlm")}
            </p>
          )}

          <p className="border-t border-border pt-3 text-xs font-medium text-muted-foreground">
            {result.disclaimer}
          </p>

          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 text-sm font-semibold text-teal-700 underline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("express.again")}
          </button>
        </article>
      )}

      {result?.kind === "fallback" && (
        <article className="mat-card slide-up space-y-3 border-l-4 border-l-soon p-4">
          <p className="text-base text-foreground">{result.message}</p>
          <p className="text-sm font-semibold text-foreground">{result.contact_type}</p>
          <p className="border-t border-border pt-3 text-xs font-medium text-muted-foreground">
            {result.disclaimer}
          </p>
          <button
            type="button"
            onClick={reset}
            className="text-sm font-semibold text-teal-700 underline"
          >
            {t("express.again")}
          </button>
        </article>
      )}
    </section>
  );
}
