"use client";

import { useRef, useState } from "react";
import { Camera, AudioLines, Save, Trash2, RotateCcw } from "lucide-react";
import EmergencyCard from "@/components/EmergencyCard";
import type { EmergencyCardData } from "@/lib/emergencyCard";
import { blobToWavBase64 } from "@/lib/audioClient";
import { useLang } from "@/components/LangProvider";
import { useConversations } from "@/hooks/useConversations";

interface InterpretationResponse {
  kind: "interpretation";
  document_type: string;
  explanation_native: string;
  explanation_en: string;
  explanation_source: string;
  next_steps: string[];
  questions_en: string[];
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
  disclaimer: string;
}

type InterpretResponse =
  | InterpretationResponse
  | EmergencyResponse
  | FallbackResponse;

/** Client-side cap, mirrors the route's ~8MB decoded limit. */
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
/** Audio recordings can be larger; decoded client-side before STT. */
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InterpretFlow() {
  const { lang, dir, t } = useLang();
  const rtl = dir === "rtl";

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterpretResponse | null>(null);
  const [error, setError] = useState(false);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"photo" | "audio" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [savedFlash, setSavedFlash] = useState(false);
  const { items, save, remove } = useConversations();

  async function onPhotoChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || ocrLoading || loading) return;

    setOcrError(null);
    setConfirm(null);
    if (!file.type.startsWith("image/") || file.size > MAX_PHOTO_BYTES) {
      setOcrError(t("interpret.error"));
      return;
    }

    setOcrLoading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const imageBase64 = dataUrl.slice(dataUrl.indexOf(",") + 1);

      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: file.type }),
      });
      const data = (await res.json().catch(() => null)) as
        | { text?: string; error?: string }
        | null;

      if (res.ok && data?.text) {
        setText(data.text);
        setConfirm("photo");
      } else {
        setOcrError(data?.error ?? t("interpret.error"));
      }
    } catch {
      setOcrError(t("interpret.error"));
    } finally {
      setOcrLoading(false);
    }
  }

  async function onAudioChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || ocrLoading || loading) return;

    setOcrError(null);
    setConfirm(null);
    if (!file.type.startsWith("audio/") || file.size > MAX_AUDIO_BYTES) {
      setOcrError(t("interpret.error"));
      return;
    }

    setOcrLoading(true);
    try {
      const audioBase64 = await blobToWavBase64(file);
      const res = await fetch("/api/stt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64, mimeType: "audio/wav" }),
      });
      const data = (await res.json().catch(() => null)) as
        | { text?: string; error?: string }
        | null;

      if (res.ok && data?.text) {
        setText(data.text);
        setConfirm("audio");
      } else {
        setOcrError(data?.error ?? t("interpret.error"));
      }
    } catch {
      setOcrError(t("interpret.error"));
    } finally {
      setOcrLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(false);
    setResult(null);
    setOcrError(null);
    setConfirm(null);
    setSavedFlash(false);
    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      const data = (await res.json()) as InterpretResponse;
      setResult(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function saveCurrent(r: InterpretationResponse) {
    save({
      inputText: text,
      documentType: r.document_type,
      explanationEn: r.explanation_en,
    });
    setSavedFlash(true);
  }

  function reset() {
    setResult(null);
    setText("");
    setError(false);
    setOcrError(null);
    setConfirm(null);
    setSavedFlash(false);
  }

  if (result?.kind === "emergency") {
    return <EmergencyCard card={result.card} lang={lang} />;
  }

  return (
    <section className="w-full space-y-4">
      <h2 className="text-xl font-bold text-foreground" dir={rtl ? "rtl" : undefined}>
        {t("interpret.title")}
      </h2>

      <p className="text-sm text-muted-foreground" dir={rtl ? "rtl" : undefined}>
        {t("interpret.subtitle")}
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPhotoChosen}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={onAudioChosen}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={ocrLoading || loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:border-teal-400 disabled:opacity-40"
          >
            <Camera className="h-4 w-4 text-teal-700" />
            {ocrLoading && confirm !== "audio" ? t("interpret.photoReading") : t("interpret.photo")}
          </button>
          <button
            type="button"
            onClick={() => audioInputRef.current?.click()}
            disabled={ocrLoading || loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:border-teal-400 disabled:opacity-40"
          >
            <AudioLines className="h-4 w-4 text-teal-700" />
            {ocrLoading && confirm === "audio" ? t("interpret.audioReading") : t("interpret.audio")}
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {t("interpret.photoPrivacy")}
        </p>

        {ocrError && (
          <div className="space-y-2 rounded-lg bg-amber-50 p-3">
            <p className="text-sm text-foreground">{ocrError}</p>
            <p className="text-sm text-muted-foreground">{t("interpret.photoTypeInstead")}</p>
          </div>
        )}

        {confirm === "photo" && (
          <p className="rounded-lg bg-teal-50 p-3 text-sm text-teal-900">
            {t("interpret.photoConfirm")}
          </p>
        )}
        {confirm === "audio" && (
          <p className="rounded-lg bg-teal-50 p-3 text-sm text-teal-900">
            {t("interpret.audioConfirm")}
          </p>
        )}

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setConfirm(null);
          }}
          placeholder={t("interpret.placeholder")}
          dir="auto"
          rows={5}
          className="w-full resize-none rounded-xl border border-border bg-card p-3 text-base text-foreground focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full rounded-xl bg-teal-600 px-4 py-3 text-base font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {loading ? t("interpret.loading") : t("interpret.submit")}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">{t("interpret.privacy")}</p>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-urgent">{t("interpret.error")}</p>
      )}

      {result?.kind === "interpretation" && (
        <article className="mat-card slide-up space-y-4 border-l-4 border-l-routine p-4">
          {result.offline && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              <span aria-hidden="true">●</span>
              {t("interpret.offline")}
            </p>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("interpret.typeHeading")}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{result.document_type}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("interpret.explanationHeading")}
            </p>
            <p
              className="mt-1 whitespace-pre-line text-base leading-relaxed text-foreground"
              dir="auto"
            >
              {result.explanation_native}
            </p>
          </div>

          <div className="rounded-xl bg-teal-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              {t("interpret.englishHeading")}
            </p>
            <p className="mt-1 whitespace-pre-line text-base leading-relaxed text-foreground">
              {result.explanation_en}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("interpret.stepsHeading")}
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-base text-foreground">
              {result.next_steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("interpret.questionsHeading")}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-foreground">
              {result.questions_en.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">{t("interpret.sourceHeading")}:</span>{" "}
            {result.explanation_source}
          </p>

          {!result.offline && result.source && result.source !== "none" && (
            <p className="text-[11px] text-muted-foreground">
              {result.source === "gemini" ? t("interpret.genGemini") : t("interpret.genGlm")}
            </p>
          )}

          <p className="border-t border-border pt-3 text-xs font-medium text-muted-foreground">
            {result.disclaimer}
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => saveCurrent(result)}
              disabled={savedFlash}
              className="flex items-center gap-1.5 rounded-lg bg-teal-100 px-3 py-1.5 text-sm font-semibold text-teal-800 disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              {savedFlash ? t("interpret.saved") : t("interpret.save")}
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 text-sm font-semibold text-teal-700 underline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t("interpret.again")}
            </button>
          </div>
        </article>
      )}

      {result?.kind === "fallback" && (
        <article className="mat-card slide-up space-y-3 border-l-4 border-l-soon p-4">
          <p className="text-base text-foreground">{result.message}</p>
          <p className="border-t border-border pt-3 text-xs font-medium text-muted-foreground">
            {result.disclaimer}
          </p>
          <button
            type="button"
            onClick={reset}
            className="text-sm font-semibold text-teal-700 underline"
          >
            {t("interpret.again")}
          </button>
        </article>
      )}

      {/* Saved on-device conversations */}
      <div className="space-y-2 border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground">
          {t("interpret.savedHeading")}
        </p>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("interpret.savedEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((c) => (
              <li key={c.id} className="mat-card flex items-start gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {c.documentType}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{formatDate(c.date)}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {c.explanationEn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  aria-label={t("interpret.savedDelete")}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
