"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandLockup } from "@/components/branding/brand-lockup";
import { IQfinansAiAssistantIcon } from "@/components/branding/iqfinans-ai-assistant-icon";
import { cn } from "@/lib/common/utils";
import { Button } from "@/components/ui/button";
import { DASHBOARD_PAGE_PAD_X } from "@/components/dashboard/dashboard-shell-constants";

export type DashboardShellHeaderProps = {
  menuOpen: boolean;
  onMenuToggle: () => void;
};

export function DashboardShellHeader({
  menuOpen,
  onMenuToggle,
}: DashboardShellHeaderProps) {
  return (
    <header className="relative z-40 flex h-14 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div
        className={cn(
          "relative flex min-h-0 min-w-0 flex-1 items-center justify-between gap-2",
          DASHBOARD_PAGE_PAD_X,
        )}
      >
        <div className="relative z-20 flex shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 cursor-pointer sm:h-10 sm:w-10 lg:hidden"
            onClick={onMenuToggle}
            aria-label={menuOpen ? "Menüyü kapat" : "Menü"}
            title={menuOpen ? "Menüyü kapat" : "Menü"}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <Link
          href="/gosterge-paneli"
          className={cn(
            "pointer-events-auto absolute left-1/2 top-1/2 z-10 inline-flex min-w-0 max-w-[min(260px,calc(100%-7rem))] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "lg:max-w-[min(260px,calc(100%-2rem))]",
          )}
          aria-label="Ana panele git"
          title="Ana panel"
        >
          <BrandLockup
            variant="sidebar"
            className={cn(
              "min-w-0 origin-center gap-1 sm:gap-2",
              "max-[500px]:scale-90",
              "min-[500px]:scale-[1.12]",
            )}
          />
        </Link>
        <div className="relative z-20 shrink-0 lg:hidden">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer sm:h-10 sm:w-10 [&_svg]:size-5 sm:[&_svg]:size-6"
          >
            <Link
              href="/yapay-zeka-asistani"
              aria-label="IQfinansAI Asistanı"
              title="IQfinansAI Asistanı"
            >
              <IQfinansAiAssistantIcon className="size-5 shrink-0 sm:size-6" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
