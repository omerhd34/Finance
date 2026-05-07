"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  dashboardNav,
  premiumNavHrefs,
} from "@/components/dashboard/dashboard-shell-constants";
import { cn, currencySymbolLabel } from "@/lib/common/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DashboardSidebarProps = {
  collapsed: boolean;
  isMobile?: boolean;
  pathname: string;
  onMobileNavigate: () => void;
  onToggleCollapsed: () => void;
  currency: string;
  currencySaving: boolean;
  profileHref: string;
  sidebarAvatarSrc?: string;
  sidebarFallbackInitials: string;
  userDisplayName: string;
  userEmail: string | null | undefined;
  sessionUserPresent: boolean;
  onCurrencyChange: (next: string) => void;
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
  sidebarAvatarSrc,
  sidebarFallbackInitials,
  userDisplayName,
  userEmail,
  sessionUserPresent,
  onCurrencyChange,
}: DashboardSidebarProps) {
  return (
    <>
      {!isMobile && (
        <div
          className={cn(
            "flex shrink-0 items-center border-b border-border",
            collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
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
                : "h-9 w-full justify-start gap-3 px-3 text-sm font-medium",
            )}
            onClick={onToggleCollapsed}
            aria-label={
              collapsed ? "Kenar çubuğunu genişlet" : "Kenar çubuğunu daralt"
            }
            title={
              collapsed ? "Kenar çubuğunu genişlet" : "Kenar çubuğunu daralt"
            }
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" aria-hidden />
            ) : (
              <>
                <span className="grid h-5 w-5 shrink-0 place-items-center">
                  <PanelLeftClose className="h-4 w-4" aria-hidden />
                </span>
                <span>Daralt</span>
              </>
            )}
          </Button>
        </div>
      )}
      <nav
        className={cn(
          "flex flex-1 flex-col gap-1",
          collapsed ? "p-2 pt-1" : "p-3 pt-2",
        )}
      >
        {dashboardNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const isPremium = premiumNavHrefs.has(href);
          return (
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
              <span className="grid h-5 w-5 shrink-0 place-items-center">
                <Icon
                  className={cn(
                    "h-4 w-4",
                    href === "/yapay-zeka-asistani" && "scale-110",
                  )}
                />
              </span>
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto" />
      {collapsed ? (
        <div className="flex flex-col items-center gap-2 border-t border-border p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={currencySaving || !sessionUserPresent}
                className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border-border/80 bg-muted/25 shadow-none"
                title={`Para birimi: ${currency}`}
                aria-label="Para birimi seç"
              >
                <span className="text-xs font-semibold tabular-nums">
                  {currencySymbolLabel(currency)}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-44"
              align={isMobile ? "start" : "center"}
              side={isMobile ? "bottom" : "right"}
              sideOffset={6}
            >
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Para birimi
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={currency}
                onValueChange={(v) => void onCurrencyChange(v)}
              >
                <DropdownMenuRadioItem value="TL" className="cursor-pointer">
                  TL (₺)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="USD" className="cursor-pointer">
                  USD ($)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="EUR" className="cursor-pointer">
                  EUR (€)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="GBP" className="cursor-pointer">
                  GBP (£)
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href={profileHref}
            onClick={onMobileNavigate}
            className="flex justify-center rounded-lg bg-muted/30 p-1.5"
            title="Profil"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={sidebarAvatarSrc} alt="" />
              <AvatarFallback className="bg-primary/20 text-primary">
                {sidebarFallbackInitials}
              </AvatarFallback>
            </Avatar>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="Çıkış yap"
            aria-label="Çıkış yap"
            onClick={() => void signOut({ callbackUrl: "/" })}
            className="h-9 w-9 cursor-pointer rounded-lg border-destructive/25 bg-destructive/6 text-destructive shadow-none transition-colors hover:border-destructive/45 hover:bg-destructive/15 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 -scale-x-100" aria-hidden />
          </Button>
        </div>
      ) : (
        <>
          <div className="border-t border-border p-3">
            <Select
              value={currency}
              disabled={currencySaving || !sessionUserPresent}
              onValueChange={(v) => void onCurrencyChange(v)}
            >
              <SelectTrigger
                className="h-9 w-full cursor-pointer rounded-lg border-border/80 bg-muted/30 shadow-none"
                aria-label="Para birimi"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                <SelectItem value="TL" className="cursor-pointer">
                  TL (₺)
                </SelectItem>
                <SelectItem value="USD" className="cursor-pointer">
                  USD ($)
                </SelectItem>
                <SelectItem value="EUR" className="cursor-pointer">
                  EUR (€)
                </SelectItem>
                <SelectItem value="GBP" className="cursor-pointer">
                  GBP (£)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border-t border-border p-3">
            <Link
              href={profileHref}
              onClick={onMobileNavigate}
              className="flex items-center gap-3 rounded-lg bg-muted/30 px-1 py-2 transition-colors hover:bg-muted/50"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={sidebarAvatarSrc} alt="" />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {sidebarFallbackInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {userDisplayName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </Link>
            <Button
              type="button"
              variant="outline"
              className="relative mt-2 flex w-full cursor-pointer items-center justify-center rounded-lg border-destructive/25 bg-destructive/6 px-3 py-2.5 text-sm font-medium text-destructive shadow-none transition-colors hover:border-destructive/45 hover:bg-destructive/15 hover:text-destructive"
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
    </>
  );
}
