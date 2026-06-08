"use client";

import Link from "next/link";
import {
  Bell,
  Lightbulb,
  LightbulbOff,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { IQfinansAiAssistantIcon } from "@/components/branding/iqfinans-ai-assistant-icon";
import { cn } from "@/lib/common/utils";
import { Button } from "@/components/ui/button";
import { DASHBOARD_PAGE_PAD_X } from "@/components/dashboard/dashboard-shell-constants";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";

export type DashboardShellHeaderProps = {
  menuOpen: boolean;
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebarCollapsed: () => void;
  themeReady: boolean;
  themeResolved: boolean;
  resolvedTheme: string | undefined;
  onToggleTheme: () => void;
};

export function DashboardShellHeader({
  menuOpen,
  onMenuToggle,
  sidebarCollapsed,
  onToggleSidebarCollapsed,
  themeReady,
  themeResolved,
  resolvedTheme,
  onToggleTheme,
}: DashboardShellHeaderProps) {
  const { unreadCount } = useNotificationUnreadCount();
  const themeLabel = themeResolved
    ? resolvedTheme === "dark"
      ? "Açık temaya geç"
      : "Koyu temaya geç"
    : "Tema";

  return (
    <header className="relative z-40 flex h-14 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 items-center justify-between gap-2",
          DASHBOARD_PAGE_PAD_X,
        )}
      >
        <div className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 cursor-pointer rounded-lg text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground lg:hidden"
            onClick={onMenuToggle}
            aria-label={menuOpen ? "Menüyü kapat" : "Menü"}
            title={menuOpen ? "Menüyü kapat" : "Menü"}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 shrink-0 cursor-pointer rounded-lg text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground lg:inline-flex"
            onClick={onToggleSidebarCollapsed}
            aria-label={
              sidebarCollapsed
                ? "Kenar çubuğunu genişlet"
                : "Kenar çubuğunu daralt"
            }
            title={
              sidebarCollapsed
                ? "Kenar çubuğunu genişlet"
                : "Kenar çubuğunu daralt"
            }
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden />
            ) : (
              <PanelLeftClose className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!themeReady}
            className="h-9 w-9 shrink-0 cursor-pointer rounded-lg text-muted-foreground shadow-none transition-colors hover:bg-muted/50 hover:text-foreground"
            aria-label={themeLabel}
            title={themeLabel}
            onClick={onToggleTheme}
          >
            {themeResolved ? (
              resolvedTheme === "dark" ? (
                <Lightbulb className="h-4 w-4" aria-hidden />
              ) : (
                <LightbulbOff className="h-4 w-4" aria-hidden />
              )
            ) : (
              <LightbulbOff className="h-4 w-4 opacity-60" aria-hidden />
            )}
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 shrink-0 cursor-pointer rounded-lg text-muted-foreground shadow-none transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Link
              href="/bildirimler"
              aria-label={
                unreadCount > 0
                  ? `Bildirimler (${unreadCount} okunmamış)`
                  : "Bildirimler"
              }
              title="Bildirimler"
            >
              <Bell className="h-4 w-4" aria-hidden />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 cursor-pointer rounded-lg text-muted-foreground shadow-none transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Link
              href="/yapay-zeka-asistani"
              aria-label="IQfinansAI Asistanı"
              title="IQfinansAI Asistanı"
            >
              <IQfinansAiAssistantIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
