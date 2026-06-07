"use client";

import { useEffect, useRef } from "react";

interface Props {
  onClose: () => void;
}

export default function PrivacyModal({ onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
        tabIndex={-1}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl outline-none"
      >
        <h2
          id="privacy-modal-title"
          className="mb-4 text-base font-semibold text-slate-900"
        >
          Privacy &amp; Data
        </h2>

        <ul className="space-y-3 text-sm text-slate-700">
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-green-600">✓</span>
            <span>
              <strong>Your data stays on your device.</strong> Voice and
              interpreter features send your text to an AI in the cloud to
              generate a response — nothing is saved or linked to you afterwards.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-green-600">✓</span>
            <span>
              <strong>No account or login required.</strong> Nothing is linked
              to you personally.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-amber-500">!</span>
            <span>
              <strong>Not a professional interpreter service.</strong> This tool
              supports communication — it does not replace a qualified NHS
              interpreter.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-amber-500">!</span>
            <span>
              <strong>Not medical advice.</strong> Always confirm with your
              midwife or doctor. In an emergency, call{" "}
              <a
                href="tel:999"
                className="font-semibold text-red-600 underline"
              >
                999
              </a>
              .
            </span>
          </li>
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
