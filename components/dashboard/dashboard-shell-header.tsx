"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandLockup } from "@/components/branding/brand-lockup";
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
          "relative flex min-h-0 min-w-0 flex-1 items-center",
          DASHBOARD_PAGE_PAD_X,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center justify-start gap-2 sm:gap-3">
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
          <Link
            href="/gosterge-paneli"
            className={cn(
              "z-10 inline-flex min-w-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "max-[420px]:relative max-[420px]:max-w-[calc(100%-3.5rem)] max-[420px]:flex-1 max-[420px]:justify-start",
              "min-[425px]:absolute min-[425px]:left-1/2 min-[425px]:top-1/2 min-[425px]:max-w-[min(260px,calc(100%-7rem))] min-[425px]:-translate-x-1/2 min-[425px]:-translate-y-1/2 min-[425px]:justify-center",
              "max-[430px]:max-w-[min(118px,calc(100%-3.5rem))] sm:max-w-[min(196px,calc(100%-8rem))] lg:max-w-[260px]",
            )}
            aria-label="Ana panele git"
            title="Ana panel"
          >
            <BrandLockup
              variant="sidebar"
              className={cn(
                "min-w-0 gap-1 sm:gap-2",
                "max-[500px]:origin-left max-[500px]:scale-90",
                "min-[500px]:origin-center min-[500px]:scale-[1.12]",
              )}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
