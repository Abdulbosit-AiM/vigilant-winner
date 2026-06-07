"use client";

import Link from "next/link";
import {
  MessageSquare,
  FileText,
  ClipboardList,
  TrendingUp,
  Languages,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/components/LangProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PrivacyLink from "@/components/PrivacyLink";

const FEATURES: { key: string; href: string; icon: LucideIcon; color: string }[] =
  [
    { key: "express", href: "/express", icon: MessageSquare, color: "bg-teal-50 text-teal-700" },
    { key: "interpret", href: "/interpret", icon: FileText, color: "bg-amber-50 text-amber-700" },
    { key: "log", href: "/log", icon: ClipboardList, color: "bg-violet-50 text-violet-700" },
    { key: "patterns", href: "/patterns", icon: TrendingUp, color: "bg-orange-50 text-orange-700" },
    { key: "culture", href: "/culture", icon: Languages, color: "bg-rose-50 text-rose-700" },
  ];

export default function HomeScreen() {
  const t = useT();

  return (
    <div className="flex min-h-full flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img
          src="/maternify-hero.webp"
          alt="Pregnant woman using the Maternify app"
          className="h-56 w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("common.appName")}
          </h1>
          <p className="mt-0.5 text-sm italic text-muted-foreground">
            “{t("home.tagline")}”
          </p>
        </div>
      </div>

      {/* Language switcher */}
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("home.languageLabel")}
        </span>
        <LanguageSwitcher />
      </div>

      {/* Mission */}
      <div className="px-5 py-4">
        <div className="mat-card-teal p-4">
          <p className="text-sm leading-relaxed text-teal-900">
            {t("home.mission")}
          </p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="flex flex-col gap-3 px-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("home.featuresLabel")}
        </p>
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Link
              key={f.href}
              href={f.href}
              className="mat-card flex items-center gap-4 p-4 text-left transition-shadow hover:shadow-md active:scale-[0.98]"
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${f.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">
                  {t(`home.${f.key}.title`)}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {t(`home.${f.key}.desc`)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>

      {/* Safety note + privacy */}
      <div className="mt-6 px-5">
        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            {t("home.safety")}
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <PrivacyLink />
          </p>
        </div>
      </div>
    </div>
  );
}
