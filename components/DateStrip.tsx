"use client";

import { useEffect, useRef } from "react";
import { addDays, toDateKey } from "@/lib/symptomLog";

interface Props {
  /** Number of days to show, ending today. */
  days?: number;
  selected: string;
  onSelect: (dateKey: string) => void;
  hasEntry: (dateKey: string) => boolean;
}

/** Horizontal-scroll day picker. Tap a day to add/edit that day's check-in. */
export default function DateStrip({
  days = 21,
  selected,
  onSelect,
  hasEntry,
}: Props) {
  const today = new Date();
  const todayKey = toDateKey(today);
  const dates = Array.from({ length: days }, (_, i) =>
    addDays(today, -(days - 1 - i)),
  );
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Scroll the selected day into view on mount / when it changes.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
    });
  }, [selected]);

  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-1">
      {dates.map((d) => {
        const key = toDateKey(d);
        const isSelected = key === selected;
        const isToday = key === todayKey;
        return (
          <button
            key={key}
            ref={isSelected ? selectedRef : undefined}
            type="button"
            onClick={() => onSelect(key)}
            aria-pressed={isSelected}
            className={`flex h-16 w-12 flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border text-center transition-colors ${
              isSelected
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-border bg-card text-foreground hover:border-teal-400"
            }`}
          >
            <span
              className={`text-[10px] font-medium uppercase ${isSelected ? "text-teal-50" : "text-muted-foreground"}`}
            >
              {d.toLocaleDateString("en-GB", { weekday: "short" })}
            </span>
            <span className="text-base font-bold leading-none">{d.getDate()}</span>
            <span className="flex h-1.5 items-center">
              {hasEntry(key) ? (
                <span
                  className={`block h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-teal-500"}`}
                />
              ) : isToday ? (
                <span className="text-[8px] font-semibold uppercase tracking-wide opacity-70">
                  •
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
