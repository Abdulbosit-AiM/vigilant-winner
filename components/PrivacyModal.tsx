"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/components/LangProvider";

interface Props {
  onClose: () => void;
}

export default function PrivacyModal({ onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const t = useT();

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => prev?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const points: { tone: "ok" | "warn"; title: string; body: string }[] = [
    { tone: "ok", title: t("privacy.local"), body: t("privacy.localBody") },
    { tone: "ok", title: t("privacy.cloud"), body: t("privacy.cloudBody") },
    {
      tone: "ok",
      title: t("privacy.noAccount"),
      body: t("privacy.noAccountBody"),
    },
    {
      tone: "warn",
      title: t("privacy.notInterpreter"),
      body: t("privacy.notInterpreterBody"),
    },
    {
      tone: "warn",
      title: t("privacy.notMedical"),
      body: t("privacy.notMedicalBody"),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
        tabIndex={-1}
        className="mat-card w-full max-w-sm p-6 outline-none"
      >
        <h2
          id="privacy-modal-title"
          className="mb-4 text-base font-semibold text-foreground"
        >
          {t("privacy.title")}
        </h2>

        <ul className="space-y-3 text-sm text-foreground">
          {points.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span
                aria-hidden="true"
                className={`mt-0.5 shrink-0 ${p.tone === "ok" ? "text-teal-600" : "text-amber-500"}`}
              >
                {p.tone === "ok" ? "✓" : "!"}
              </span>
              <span>
                <strong>{p.title}</strong> {p.body}
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-teal-600 py-3 text-sm font-semibold text-white active:scale-95"
        >
          {t("common.close")}
        </button>
      </div>
    </div>
  );
}
