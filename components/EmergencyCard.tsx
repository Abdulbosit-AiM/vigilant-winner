import { buildEmergencyCard, type EmergencyCardData } from "@/lib/emergencyCard";

interface EmergencyCardProps {
  card?: EmergencyCardData;
}

export default function EmergencyCard({ card = buildEmergencyCard() }: EmergencyCardProps) {
  return (
    <div
      role="alert"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-urgent px-6 py-10 text-center text-white"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold leading-tight">{card.headline_en}</h1>
        <p className="text-lg font-semibold text-red-100">{card.headline_zh}</p>
      </div>

      <div className="space-y-1">
        <p className="text-base font-medium">{card.body_en}</p>
        <p className="text-base font-medium text-red-100">{card.body_zh}</p>
      </div>

      <div className="flex w-full max-w-device flex-col gap-3">
        <a
          href={card.primary.tel}
          className="rounded-xl bg-white px-6 py-4 text-lg font-bold text-urgent shadow-lg"
        >
          {card.primary.label_en}
          <span className="ml-2 font-semibold text-red-700">{card.primary.label_zh}</span>
        </a>
        <a
          href={card.secondary.tel}
          className="rounded-xl border-2 border-white px-6 py-3 text-base font-semibold text-white"
        >
          {card.secondary.label_en}
          <span className="ml-2 text-red-100">{card.secondary.label_zh}</span>
        </a>
      </div>

      <div className="space-y-1 text-sm text-red-100">
        <p>{card.maternity_note_en}</p>
        <p>{card.maternity_note_zh}</p>
      </div>

      <p className="mt-2 max-w-device text-xs font-medium text-red-100">{card.disclaimer}</p>
    </div>
  );
}
