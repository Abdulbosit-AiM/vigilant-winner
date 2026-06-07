"use client";

import { LANGS, LANG_LABELS } from "@/lib/languages";
import { useLang } from "@/components/LangProvider";

/** Pill row of language options. Switches the whole app via the LangProvider. */
export default function LanguageSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={`inline-flex overflow-hidden rounded-full border border-border bg-card text-xs font-semibold ${className}`}
    >
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-3 py-1.5 transition-colors ${
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
