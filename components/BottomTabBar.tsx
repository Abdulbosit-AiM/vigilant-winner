"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home as HomeIcon,
  MessageSquare,
  FileText,
  ClipboardList,
  TrendingUp,
  Languages,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/components/LangProvider";

const NAV_ITEMS: { href: string; icon: LucideIcon; key: string }[] = [
  { href: "/", icon: HomeIcon, key: "nav.home" },
  { href: "/express", icon: MessageSquare, key: "nav.express" },
  { href: "/interpret", icon: FileText, key: "nav.interpret" },
  { href: "/log", icon: ClipboardList, key: "nav.log" },
  { href: "/patterns", icon: TrendingUp, key: "nav.patterns" },
  { href: "/culture", icon: Languages, key: "nav.culture" },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ href, icon: Icon, key }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                isActive ? "tab-active" : "tab-inactive hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className="text-[10px] font-medium leading-none">
                {t(key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
