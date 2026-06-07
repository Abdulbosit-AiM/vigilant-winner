"use client";

import { LANGS, LANG_LABELS } from "@/lib/languages";
import { useLang } from "@/components/LangProvider";

/** Pill row of language options. Switches the whole app via the LangProvider. */
export default function LanguageSwitcher({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { lang, setLang } = useLang();
  const pad = compact ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs";
  return (
    <div
      className={`inline-flex overflow-hidden rounded-full border border-border bg-card font-semibold ${className}`}
    >
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`${pad} transition-colors ${
            lang === code
              ? "bg-teal-600 text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {LANG_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
