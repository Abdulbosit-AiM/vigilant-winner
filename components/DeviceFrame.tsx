"use client";

import { useEffect, useState } from "react";

/**
 * Mobile-app simulator shell (PRD §11.1). Presentation only — it MUST NOT change
 * app behaviour, routing, or the API. A Simulator⇄Webview toggle (persisted in
 * localStorage) switches between the app inside a CSS phone frame and a plain
 * full-bleed webview. Defaults to Simulator on desktop (≥768px) and Webview on a
 * real phone (<768px). Renders plain children until mounted to avoid a hydration
 * mismatch (the chosen view depends on localStorage + viewport, both client-only).
 */

type View = "simulator" | "webview";

const STORAGE_KEY = "maternify:view";
const DESKTOP_MIN_WIDTH = 768;

const LABELS = {
  simulator: "Simulator",
  webview: "Webview",
  switchToWebview: "Switch to Webview",
  switchToSimulator: "Switch to Simulator",
};

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-7 pt-2.5 text-[13px] font-semibold text-slate-900">
      <span>9:41</span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="text-[11px] tracking-tight">●●●●</span>
        <span className="text-[11px]">WiFi</span>
        <span className="inline-block h-3 w-6 rounded-[3px] border border-slate-900 px-[2px] py-[2px]">
          <span className="block h-full w-3/4 rounded-[1px] bg-slate-900" />
        </span>
      </div>
    </div>
  );
}

function ViewToggle({ view, onToggle }: { view: View; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={view === "simulator" ? LABELS.switchToWebview : LABELS.switchToSimulator}
      className="fixed right-3 top-3 z-[60] flex items-center gap-2 rounded-full border border-slate-300 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur"
    >
      <span className={view === "simulator" ? "text-slate-900" : "text-slate-400"}>
        {LABELS.simulator}
      </span>
      <span aria-hidden="true" className="text-slate-400">
        ⇄
      </span>
      <span className={view === "webview" ? "text-slate-900" : "text-slate-400"}>
        {LABELS.webview}
      </span>
    </button>
  );
}

export default function DeviceFrame({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "simulator" || stored === "webview") {
      setView(stored);
      return;
    }
    setView(window.innerWidth >= DESKTOP_MIN_WIDTH ? "simulator" : "webview");
  }, []);

  function toggle() {
    setView((prev) => {
      const next: View = prev === "simulator" ? "webview" : "simulator";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  // Pre-hydration / first paint: render plain full-bleed to match SSR output.
  if (view === null) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (view === "webview") {
    return (
      <div className="min-h-screen">
        <ViewToggle view={view} onToggle={toggle} />
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start gap-4 bg-slate-300 py-10">
      <ViewToggle view={view} onToggle={toggle} />
      <div className="relative h-[844px] w-[390px] shrink-0 rounded-[3rem] border-[6px] border-slate-900 bg-white shadow-2xl">
        <div className="relative h-full w-full overflow-hidden rounded-[2.6rem] bg-[#f1f5f9]">
          <StatusBar />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-2 z-50 h-6 w-28 -translate-x-1/2 rounded-full bg-slate-900"
          />
          <div className="h-[calc(844px-2.75rem)] overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
