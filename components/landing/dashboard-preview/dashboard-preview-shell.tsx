"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  Bell,
  CalendarClock,
  Calculator,
  HandCoins,
  LayoutDashboard,
  Lightbulb,
  PanelLeftClose,
  PanelLeftOpen,
  PieChart,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { BrandLockup } from "@/components/branding/brand-lockup";
import { IQfinansAiAssistantIcon } from "@/components/branding/iqfinans-ai-assistant-icon";
import { AnaPanelPreview } from "@/components/landing/dashboard-preview/ana-panel";
import { BildirimlerPreview } from "@/components/landing/dashboard-preview/bildirimler";
import { BorcVeAlacakPreview } from "@/components/landing/dashboard-preview/borc-ve-alacak";
import { ButcelerPreview } from "@/components/landing/dashboard-preview/butceler";
import { HesaplamalarPreview } from "@/components/landing/dashboard-preview/hesaplamalar";
import { IQfinansAIAnalizPreview } from "@/components/landing/dashboard-preview/iqfinansai-analiz";
import { IQfinansAIAsistaniPreview } from "@/components/landing/dashboard-preview/iqfinansai-asistani";
import { IslemlerPreview } from "@/components/landing/dashboard-preview/islemler";
import { KurDonusumPreview } from "@/components/landing/dashboard-preview/kur-donusum";
import { TekrarlayanPreview } from "@/components/landing/dashboard-preview/tekrarlayan";
import { YatirimPreview } from "@/components/landing/dashboard-preview/yatirim";
import { cn } from "@/lib/common/utils";

type SidebarKey =
  | "ana-panel"
  | "islemler"
  | "tekrarlayan"
  | "butceler"
  | "borc-ve-alacak"
  | "kur-donusum"
  | "hesaplamalar"
  | "yatirim"
  | "ai-analiz"
  | "ai-asistani"
  | "bildirimler";

type SidebarLink = {
  key: SidebarKey;
  label: string;
  icon: LucideIcon;
  divider?: boolean;
};

const SIDEBAR_LINKS: SidebarLink[] = [
  { key: "ana-panel", label: "Ana Panel", icon: LayoutDashboard },
  { key: "islemler", label: "İşlemler", icon: Wallet },
  { key: "tekrarlayan", label: "Tekrarlayan", icon: CalendarClock },
  { key: "butceler", label: "Bütçeler", icon: PieChart },
  { key: "borc-ve-alacak", label: "Borç ve Alacak", icon: HandCoins },
  { key: "kur-donusum", label: "Kur Dönüşüm", icon: ArrowRightLeft },
  {
    key: "hesaplamalar",
    label: "Hesaplamalar",
    icon: Calculator,
    divider: true,
  },
  { key: "yatirim", label: "Yatırım", icon: TrendingUp },
  { key: "ai-analiz", label: "IQfinansAI Analiz", icon: Sparkles },
  {
    key: "ai-asistani",
    label: "IQfinansAI Asistanı",
    icon: IQfinansAiAssistantIcon as unknown as LucideIcon,
    divider: true,
  },
  { key: "bildirimler", label: "Bildirimler", icon: Bell },
];

const PREVIEW_MAP: Record<SidebarKey, () => React.ReactElement> = {
  "ana-panel": AnaPanelPreview,
  islemler: IslemlerPreview,
  tekrarlayan: TekrarlayanPreview,
  butceler: ButcelerPreview,
  "borc-ve-alacak": BorcVeAlacakPreview,
  "kur-donusum": KurDonusumPreview,
  hesaplamalar: HesaplamalarPreview,
  yatirim: YatirimPreview,
  "ai-analiz": IQfinansAIAnalizPreview,
  "ai-asistani": IQfinansAIAsistaniPreview,
  bildirimler: BildirimlerPreview,
};

export function DashboardPreviewShell() {
  const [activeKey, setActiveKey] = useState<SidebarKey>("ana-panel");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const ActivePreview = PREVIEW_MAP[activeKey];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-slate-900/15 ring-1 ring-black/5 dark:shadow-black/40"
      role="img"
      aria-label="IQfinansAI dashboard önizlemesi"
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-2 sm:px-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden />
          <span
            className="h-2.5 w-2.5 rounded-full bg-emerald-400"
            aria-hidden
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveKey("ana-panel")}
          aria-label="Ana panele dön"
          className="hidden cursor-pointer rounded-md px-1 py-0.5 transition-colors hover:bg-background/80 sm:inline-flex"
        >
          <BrandLockup variant="landing" />
        </button>
        <div className="w-12" aria-hidden />
      </div>

      <div className="flex">
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-r border-border/60 bg-muted/30 transition-[width] duration-200 md:flex md:w-12",
            isSidebarOpen && "lg:w-52",
          )}
        >
          <div
            className={cn(
              "hidden h-10 items-center px-3",
              isSidebarOpen ? "lg:flex" : "md:flex md:justify-center md:px-0",
            )}
          >
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              title={isSidebarOpen ? "Menüyü daralt" : "Menüyü genişlet"}
              aria-label={isSidebarOpen ? "Menüyü daralt" : "Menüyü genişlet"}
              aria-expanded={isSidebarOpen}
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <PanelLeftOpen className="h-3.5 w-3.5" aria-hidden />
              )}
            </button>
          </div>
          <div className="hidden h-px bg-border md:block" aria-hidden />
          <nav className="flex flex-1 flex-col gap-0.5 p-2 lg:p-3 lg:pt-2">
            {SIDEBAR_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive = activeKey === item.key;
              return (
                <span key={item.key} className="contents">
                  <button
                    type="button"
                    onClick={() => setActiveKey(item.key)}
                    title={item.label}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex cursor-pointer items-center rounded-lg text-[11px] font-medium transition-colors",
                      "justify-center px-2 py-2",
                      isSidebarOpen &&
                        "lg:justify-start lg:gap-3 lg:px-3 lg:text-xs",
                      isActive
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 before:absolute before:inset-y-1 before:left-0 before:w-1 before:rounded-r-full before:bg-emerald-500"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span
                      className={cn(
                        "hidden truncate",
                        isSidebarOpen && "lg:inline",
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                  {item.divider ? (
                    <span className="my-1 block h-px bg-border" aria-hidden />
                  ) : null}
                </span>
              );
            })}
            <span className="my-1 block h-px bg-border" aria-hidden />
            <button
              type="button"
              disabled
              title="Açık tema"
              aria-label="Açık tema"
              className={cn(
                "relative flex cursor-not-allowed items-center justify-center rounded-lg px-2 py-2 text-[11px] font-medium text-muted-foreground transition-colors",
                isSidebarOpen && "lg:justify-start lg:gap-3 lg:px-3 lg:text-xs",
              )}
            >
              <Lightbulb className="h-4 w-4 shrink-0" aria-hidden />
              <span
                className={cn("hidden truncate", isSidebarOpen && "lg:inline")}
              >
                Açık tema
              </span>
            </button>
          </nav>
        </aside>

        <div className="min-w-0 flex-1 p-3 sm:p-4 lg:p-5">
          <ActivePreview />
        </div>
      </div>
    </div>
  );
}
