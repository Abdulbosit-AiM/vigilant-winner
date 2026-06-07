import { buildEmergencyCard, type EmergencyCardData } from "@/lib/emergencyCard";
import { RTL_LANGS, type Lang } from "@/lib/languages";

interface EmergencyCardProps {
  card?: EmergencyCardData;
  /** The user's selected language — shown alongside English. Defaults to zh. */
  lang?: Lang;
}

export default function EmergencyCard({
  card = buildEmergencyCard(),
  lang = "zh",
}: EmergencyCardProps) {
  // Optional chain: degrade to English-only if a stale card shape ever arrives.
  const native = lang === "en" ? null : (card.native?.[lang] ?? null);
  const dir = RTL_LANGS.includes(lang) ? "rtl" : undefined;

  return (
    <div
      role="alert"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-urgent px-6 py-10 text-center text-white"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold leading-tight">{card.en.headline}</h1>
        {native && (
          <p className="text-lg font-semibold text-red-100" dir={dir}>
            {native.headline}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-base font-medium">{card.en.body}</p>
        {native && (
          <p className="text-base font-medium text-red-100" dir={dir}>
            {native.body}
          </p>
        )}
      </div>

      <div className="flex w-full max-w-device flex-col gap-3">
        <a
          href={card.primary_tel}
          className="rounded-xl bg-white px-6 py-4 text-lg font-bold text-urgent shadow-lg"
        >
          {card.en.primary_label}
          {native && (
            <span className="ml-2 font-semibold text-red-700" dir={dir}>
              {native.primary_label}
            </span>
          )}
        </a>
        <a
          href={card.secondary_tel}
          className="rounded-xl border-2 border-white px-6 py-3 text-base font-semibold text-white"
        >
          {card.en.secondary_label}
          {native && (
            <span className="ml-2 text-red-100" dir={dir}>
              {native.secondary_label}
            </span>
          )}
        </a>
      </div>

      <div className="space-y-1 text-sm text-red-100">
        <p>{card.en.maternity_note}</p>
        {native && <p dir={dir}>{native.maternity_note}</p>}
      </div>

      <p className="mt-2 max-w-device text-xs font-medium text-red-100">{card.disclaimer}</p>
    </div>
  );
}
