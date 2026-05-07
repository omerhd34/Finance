"use client";

import Link from "next/link";
import { Menu, Moon, Sun } from "lucide-react";
import { hrefToAiAssistantPage } from "@/lib/ai/ai-insights-tabs";
import { NotificationsPopover } from "@/components/notifications/notifications-popover";
import { BrandLockup } from "@/components/branding/brand-lockup";
import { IQfinansAiAssistantIcon } from "@/components/branding/iqfinans-ai-assistant-icon";
import { cn } from "@/lib/common/utils";
import { Button } from "@/components/ui/button";
import { DASHBOARD_PAGE_PAD_X } from "@/components/dashboard/dashboard-shell-constants";

export type DashboardShellHeaderProps = {
  menuOpen: boolean;
  onMenuToggle: () => void;
  themeReady: boolean;
  themeResolved: boolean;
  resolvedTheme: string | undefined;
  onToggleTheme: () => void;
};

export function DashboardShellHeader({
  menuOpen,
  onMenuToggle,
  themeReady,
  themeResolved,
  resolvedTheme,
  onToggleTheme,
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
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-rose-700 hover:bg-rose-200/85 hover:text-rose-800 sm:h-10 sm:w-10 dark:text-rose-200 dark:hover:bg-rose-500/22 dark:hover:text-rose-100"
            asChild
            title="IQfinansAI Asistanı"
          >
            <Link
              href={hrefToAiAssistantPage()}
              aria-label="IQfinansAI Asistanına git"
            >
              <IQfinansAiAssistantIcon
                className="h-5 w-5 scale-110 sm:h-6 sm:w-6 sm:scale-[1.22]"
                aria-hidden
              />
            </Link>
          </Button>
          <div className="[&_button]:h-8 [&_button]:w-8 sm:[&_button]:h-10 sm:[&_button]:w-10">
            <NotificationsPopover />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!themeReady}
            className="h-8 w-8 cursor-pointer sm:h-10 sm:w-10"
            aria-label={
              themeResolved
                ? resolvedTheme === "dark"
                  ? "Açık temaya geç"
                  : "Koyu temaya geç"
                : "Tema"
            }
            title={
              themeResolved
                ? resolvedTheme === "dark"
                  ? "Açık temaya geç"
                  : "Koyu temaya geç"
                : "Tema"
            }
            onClick={onToggleTheme}
          >
            {themeResolved ? (
              resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground " />
              )
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground opacity-60" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
