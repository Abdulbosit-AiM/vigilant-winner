"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import BottomTabBar from "@/components/BottomTabBar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useT } from "@/components/LangProvider";

type View = "simulator" | "webview";

const STORAGE_KEY = "maternify:view";
const DESKTOP_MIN_WIDTH = 768;

/** Brand + global language switcher — fixed at the top of the app chrome. */
function TopBar() {
  return (
    <header
      dir="ltr"
      className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card/90 px-4 py-2 backdrop-blur"
    >
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.png" alt="" className="h-8 w-8" />
        <span className="text-lg font-bold tracking-tight text-foreground">
          Maternify
        </span>
      </div>
      <LanguageSwitcher compact />
    </header>
  );
}

/** The app chrome: top bar + scrolling content + bottom tabs. Fills its parent. */
function Chrome({
  children,
  notch = false,
}: {
  children: React.ReactNode;
  notch?: boolean;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {notch && (
        <div className="relative h-6 shrink-0 bg-card/90">
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1.5 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-900"
          />
        </div>
      )}
      <TopBar />
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-4">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}

function ViewToggle({
  view,
  onToggle,
}: {
  view: View;
  onToggle: () => void;
}) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={t("shell.switchView")}
      className="fixed right-3 top-3 z-[60] hidden items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur md:flex"
    >
      <span className={view === "simulator" ? "text-foreground" : "text-muted-foreground"}>
        {t("shell.simulator")}
      </span>
      <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" />
      <span className={view === "webview" ? "text-foreground" : "text-muted-foreground"}>
        {t("shell.webview")}
      </span>
    </button>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
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

  // Pre-hydration + webview: a full-height mobile column (page does not scroll;
  // content scrolls inside <main>). Matches SSR output to avoid a mismatch.
  if (view === null || view === "webview") {
    return (
      <div className="mx-auto h-[100dvh] max-w-[440px] overflow-hidden border-x border-border">
        {view !== null && <ViewToggle view="webview" onToggle={toggle} />}
        <Chrome>{children}</Chrome>
      </div>
    );
  }

  // Simulator: a phone frame whose height is capped to the viewport, so the whole
  // device is visible without scrolling the page — content scrolls inside it.
  return (
    <div className="fixed inset-0 grid place-items-center overflow-hidden bg-gradient-to-b from-slate-200 to-slate-300">
      <ViewToggle view="simulator" onToggle={toggle} />
      <div className="relative aspect-[9/19.5] h-[min(900px,calc(100dvh_-_1.5rem))] min-h-0 shrink-0 rounded-[2.8rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl">
        {/* Screen is absolutely positioned so tall content (Log/Patterns) scrolls
            INSIDE the frame and can never expand the phone's fixed size. */}
        <div className="absolute inset-0 overflow-hidden rounded-[2.1rem] bg-background">
          <Chrome notch>{children}</Chrome>
        </div>
      </div>
    </div>
  );
}
