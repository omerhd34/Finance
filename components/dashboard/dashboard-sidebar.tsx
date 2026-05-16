"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  DollarSign,
  Euro,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PoundSterling,
  Lightbulb,
  TurkishLira,
  User,
  LightbulbOff,
} from "lucide-react";
import {
  dashboardNav,
  premiumNavHrefs,
} from "@/components/dashboard/dashboard-shell-constants";
import { cn } from "@/lib/common/utils";
import { Button } from "@/components/ui/button";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";

const CURRENCY_CYCLE = ["TL", "EUR", "USD", "GBP"] as const;

const SIDEBAR_CURRENCY_LABELS: Record<string, string> = {
  TL: "Türk Lirası",
  EUR: "Euro",
  USD: "ABD Doları",
  GBP: "İngiliz Sterlini",
};

function sidebarCurrencyLabel(code: string): string {
  return SIDEBAR_CURRENCY_LABELS[code] ?? code;
}

function SidebarCurrencyIcon({ currency }: { currency: string }) {
  const Icon =
    currency === "EUR"
      ? Euro
      : currency === "USD"
        ? DollarSign
        : currency === "GBP"
          ? PoundSterling
          : TurkishLira;

  return (
    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
  );
}

function nextCurrencyInCycle(current: string): string {
  const index = CURRENCY_CYCLE.indexOf(
    current as (typeof CURRENCY_CYCLE)[number],
  );
  const nextIndex = index === -1 ? 0 : (index + 1) % CURRENCY_CYCLE.length;
  return CURRENCY_CYCLE[nextIndex];
}

export type DashboardSidebarProps = {
  collapsed: boolean;
  isMobile?: boolean;
  pathname: string;
  onMobileNavigate: () => void;
  onToggleCollapsed: () => void;
  currency: string;
  currencySaving: boolean;
  profileHref: string;
  sessionUserPresent: boolean;
  onCurrencyChange: (next: string) => void;
  themeReady: boolean;
  themeResolved: boolean;
  resolvedTheme: string | undefined;
  onToggleTheme: () => void;
};

export function DashboardSidebar({
  collapsed,
  isMobile = false,
  pathname,
  onMobileNavigate,
  onToggleCollapsed,
  currency,
  currencySaving,
  profileHref,
  sessionUserPresent,
  onCurrencyChange,
  themeReady,
  themeResolved,
  resolvedTheme,
  onToggleTheme,
}: DashboardSidebarProps) {
  const themeLabel = themeResolved
    ? resolvedTheme === "dark"
      ? "Açık temaya geç"
      : "Koyu temaya geç"
    : "Tema";
  const { unreadCount } = useNotificationUnreadCount();

  const cycleCurrency = () => {
    if (currencySaving || !sessionUserPresent) return;
    void onCurrencyChange(nextCurrencyInCycle(currency));
  };

  const notificationBadge = (placement: "collapsed" | "expanded") =>
    unreadCount > 0 ? (
      <span
        className={cn(
          "flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground",
          placement === "collapsed"
            ? "absolute -right-0.5 -top-0.5"
            : "ml-auto",
        )}
      >
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    ) : null;

  return (
    <div className="flex min-h-full flex-col">
      {!isMobile && (
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-border",
            collapsed ? "justify-center px-2" : "p-3 pt-2",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className={cn(
              "shrink-0 cursor-pointer rounded-lg text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground",
              collapsed
                ? "h-9 w-9 [&_svg]:size-5"
                : "h-9 w-auto justify-start px-3 py-2",
            )}
            onClick={onToggleCollapsed}
            aria-label={
              collapsed ? "Kenar çubuğunu genişlet" : "Kenar çubuğunu daralt"
            }
            title={
              collapsed ? "Kenar çubuğunu genişlet" : "Kenar çubuğunu daralt"
            }
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center">
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" aria-hidden />
              ) : (
                <PanelLeftClose className="h-4 w-4" aria-hidden />
              )}
            </span>
          </Button>
        </div>
      )}
      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-1",
          collapsed ? "p-2 pt-1" : "p-3 pt-2",
        )}
      >
        {dashboardNav.flatMap(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const isPremium = premiumNavHrefs.has(href);

          const item = (
            <Link
              key={href}
              href={href}
              onClick={onMobileNavigate}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2",
                active
                  ? isPremium
                    ? "relative border border-rose-300 bg-rose-200/90 text-rose-800 shadow-[0_0_0_1px_rgba(244,63,94,0.18)] before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-lg before:bg-rose-600 dark:border-rose-400/45 dark:bg-rose-700/28 dark:text-rose-50 dark:shadow-[0_0_0_1px_rgba(251,113,133,0.15)] dark:before:bg-rose-200"
                    : "relative bg-primary/15 text-primary before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-lg before:bg-primary"
                  : isPremium
                    ? "border border-rose-300/90 bg-rose-100/85 text-rose-700 hover:border-rose-400 hover:bg-rose-200/85 hover:text-rose-800 dark:border-rose-500/30 dark:bg-rose-900/28 dark:text-rose-100 dark:hover:border-rose-400/50 dark:hover:bg-rose-800/35 dark:hover:text-rose-50"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center",
                  href === "/bildirimler" &&
                    collapsed &&
                    unreadCount > 0 &&
                    "relative",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    href === "/yapay-zeka-asistani" && "scale-110",
                  )}
                />
                {href === "/bildirimler" &&
                  collapsed &&
                  notificationBadge("collapsed")}
              </span>
              {!collapsed && label}
              {href === "/bildirimler" &&
                !collapsed &&
                notificationBadge("expanded")}
            </Link>
          );

          if (href !== "/bildirimler") {
            return [item];
          }

          const profileActive =
            pathname === profileHref || pathname.startsWith(`${profileHref}/`);

          const profileItem = (
            <Link
              key={`${profileHref}-profil-nav`}
              href={profileHref}
              onClick={onMobileNavigate}
              title={collapsed ? "Profil" : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2",
                profileActive
                  ? "relative border border-sky-400/80 bg-sky-200/90 text-sky-950 shadow-[0_0_0_1px_rgba(14,165,233,0.2)] before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-lg before:bg-sky-600 dark:border-sky-400/50 dark:bg-sky-800/45 dark:text-sky-50 dark:shadow-[0_0_0_1px_rgba(56,189,248,0.18)] dark:before:bg-sky-300"
                  : "border border-sky-300/90 bg-sky-100/85 text-sky-900 hover:border-sky-400 hover:bg-sky-200/90 hover:text-sky-950 dark:border-sky-500/35 dark:bg-sky-950/45 dark:text-sky-100 dark:hover:border-sky-400/55 dark:hover:bg-sky-900/50 dark:hover:text-sky-50",
              )}
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center">
                <User className="h-4 w-4" aria-hidden />
              </span>
              {!collapsed && "Profil"}
            </Link>
          );

          return [item, profileItem];
        })}
      </nav>
      <div className="mt-auto" />
      {collapsed ? (
        <>
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              disabled={!themeReady}
              className="h-9 w-full cursor-pointer justify-center rounded-lg border border-border/80 bg-muted/25 px-2 py-2.5 text-sm font-medium text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
              aria-label={themeLabel}
              title={themeLabel}
              onClick={onToggleTheme}
            >
              {themeResolved ? (
                resolvedTheme === "dark" ? (
                  <Lightbulb
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                ) : (
                  <LightbulbOff
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                )
              ) : (
                <LightbulbOff
                  className="h-4 w-4 text-muted-foreground opacity-60"
                  aria-hidden
                />
              )}
            </Button>
          </div>
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              disabled={currencySaving || !sessionUserPresent}
              className="h-9 w-full cursor-pointer justify-center rounded-lg border border-border/80 bg-muted/25 px-2 py-2.5 text-sm font-medium text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
              title={sidebarCurrencyLabel(currency)}
              aria-label={`Para birimi: ${sidebarCurrencyLabel(currency)}`}
              onClick={cycleCurrency}
            >
              <SidebarCurrencyIcon currency={currency} />
            </Button>
          </div>
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              title="Çıkış yap"
              aria-label="Çıkış yap"
              onClick={() => void signOut({ callbackUrl: "/" })}
              className="h-9 w-full cursor-pointer justify-center rounded-lg border border-destructive/25 bg-destructive/6 px-2 py-2.5 text-sm font-medium text-destructive shadow-none transition-colors hover:border-destructive/45 hover:bg-destructive/15 hover:text-destructive"
            >
              <LogOut className="h-4 w-4 -scale-x-100" aria-hidden />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="border-t border-border p-3">
            <Button
              type="button"
              variant="ghost"
              disabled={!themeReady}
              className="h-9 w-full cursor-pointer justify-start gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
              aria-label={themeLabel}
              title={themeLabel}
              onClick={onToggleTheme}
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center">
                {themeResolved ? (
                  resolvedTheme === "dark" ? (
                    <Lightbulb className="h-4 w-4" aria-hidden />
                  ) : (
                    <LightbulbOff className="h-4 w-4" aria-hidden />
                  )
                ) : (
                  <LightbulbOff className="h-4 w-4 opacity-60" aria-hidden />
                )}
              </span>
              <span>
                {themeResolved
                  ? resolvedTheme === "dark"
                    ? "Açık tema"
                    : "Koyu tema"
                  : "Tema"}
              </span>
            </Button>
          </div>
          <div className="border-t border-border p-3">
            <Button
              type="button"
              variant="ghost"
              disabled={currencySaving || !sessionUserPresent}
              className="h-9 w-full cursor-pointer items-center justify-start gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
              aria-label={`Para birimi: ${sidebarCurrencyLabel(currency)}`}
              title={sidebarCurrencyLabel(currency)}
              onClick={cycleCurrency}
            >
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                <SidebarCurrencyIcon currency={currency} />
              </span>
              <span className="flex h-5 items-center leading-none">
                {sidebarCurrencyLabel(currency)}
              </span>
            </Button>
          </div>
          <div className="border-t border-border p-3">
            <Button
              type="button"
              variant="outline"
              className="relative flex w-full cursor-pointer items-center justify-center rounded-lg border-destructive/25 bg-destructive/6 px-3 py-2.5 text-sm font-medium text-destructive shadow-none transition-colors hover:border-destructive/45 hover:bg-destructive/15 hover:text-destructive"
              onClick={() => void signOut({ callbackUrl: "/" })}
            >
              <LogOut
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 -scale-x-100"
                aria-hidden
              />
              <span className="pointer-events-none">Çıkış yap</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
