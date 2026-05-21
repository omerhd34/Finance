"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Lightbulb,
  User,
  LightbulbOff,
  MoreVertical,
} from "lucide-react";
import {
  dashboardNav,
  profileInitials,
} from "@/components/dashboard/dashboard-shell-constants";
import { cn } from "@/lib/common/utils";
import { Button } from "@/components/ui/button";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/store/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  userImage?: string | null;
};

export function DashboardSidebar({
  collapsed,
  isMobile = false,
  pathname,
  onMobileNavigate,
  onToggleCollapsed,
  profileHref,
  themeReady,
  themeResolved,
  resolvedTheme,
  onToggleTheme,
  userImage,
}: DashboardSidebarProps) {
  const { data: session } = useSession();
  const themeLabel = themeResolved
    ? resolvedTheme === "dark"
      ? "Açık temaya geç"
      : "Koyu temaya geç"
    : "Tema";
  const { unreadCount } = useNotificationUnreadCount();

  const reduxUser = useAppSelector((state) => state.auth?.user);

  const userName = reduxUser?.name ?? session?.user?.name ?? "Kullanıcı";
  const userEmail =
    reduxUser?.email ?? session?.user?.email ?? "user@iqfinans.com";
  const finalUserImage =
    userImage ?? reduxUser?.image ?? session?.user?.image ?? undefined;

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
            "flex h-14 shrink-0 items-center",
            collapsed ? "justify-center px-2" : "px-3",
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
          collapsed ? "p-2 pt-0" : "p-3 pt-0",
          isMobile && "pt-4",
        )}
      >
        {!isMobile && (
          <Separator className="mb-1 bg-foreground/10 dark:bg-border" />
        )}

        {dashboardNav.flatMap(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

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
                  ? "relative bg-primary/15 text-primary before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-lg before:bg-primary"
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
            if (href === "/hesaplamalar" || href === "/yapay-zeka-asistani") {
              return [
                item,
                <Separator
                  key={`divider-${href}`}
                  className="my-1 bg-foreground/10 dark:bg-border"
                />,
              ];
            }
            return [item];
          }

          return [item];
        })}

        <Button
          type="button"
          variant="ghost"
          disabled={!themeReady}
          className={cn(
            "h-9 w-full cursor-pointer rounded-lg text-sm font-medium text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground transition-colors",
            collapsed
              ? "justify-center px-2 py-2.5"
              : "justify-start gap-3 px-3 py-2",
          )}
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
          {!collapsed && (
            <span>
              {themeResolved
                ? resolvedTheme === "dark"
                  ? "Açık tema"
                  : "Koyu tema"
                : "Tema"}
            </span>
          )}
        </Button>
        <Separator className="bg-foreground/10 dark:bg-border" />
      </nav>

      <div className="mt-auto" />

      {/* ALT KISIM: PROFILE ALANI */}
      <Separator className="bg-foreground/10 dark:bg-border" />

      {collapsed ? (
        <div className="py-4 flex justify-center">
          {" "}
          {/* Daraltılmış modda dikey boşluk artırıldı */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 w-10 rounded-full p-0 focus-visible:ring-0 cursor-pointer hover:bg-muted/50"
              >
                <Avatar className="h-9 w-9 rounded-full border border-border shrink-0">
                  <AvatarImage
                    src={finalUserImage ?? undefined}
                    alt=""
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                    {profileInitials(userName, userEmail)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              className="w-48 rounded-xl p-1 shadow-md border border-border bg-popover text-popover-foreground"
            >
              <DropdownMenuItem
                asChild
                className="rounded-lg focus:bg-muted focus:text-foreground"
              >
                <Link
                  href={profileHref}
                  onClick={onMobileNavigate}
                  className="flex cursor-pointer items-center gap-2 w-full px-2 py-1.5 text-sm"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg flex items-center gap-2 px-2 py-1.5 text-sm"
                onClick={() => void signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4 -scale-x-100" />
                <span>Çıkış yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="px-3 py-4">
          {" "}
          {/* py-2 yerine py-4 yapılarak alt kısım dikeyde yükseltildi */}
          <div className="flex items-center gap-2 rounded-xl p-1.5 text-left bg-transparent">
            {/* Profil Bilgisi Alanı */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-8 w-8 rounded-full border border-border shrink-0">
                <AvatarImage
                  src={finalUserImage ?? undefined}
                  alt=""
                  className="object-cover"
                />
                <AvatarFallback className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  {profileInitials(userName, userEmail)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-foreground truncate leading-tight">
                  {userName}
                </span>
                <span className="text-[11px] text-muted-foreground truncate leading-none mt-0.5">
                  {userEmail}
                </span>
              </div>
            </div>

            {/* Sadece "..." Butonuna Tıklanınca Açılan Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg shrink-0 text-muted-foreground hover:text-foreground focus-visible:ring-0 cursor-pointer p-0"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-48 rounded-xl p-1 shadow-md border border-border bg-popover text-popover-foreground mb-1"
              >
                <DropdownMenuItem
                  asChild
                  className="rounded-lg focus:bg-muted focus:text-foreground"
                >
                  <Link
                    href={profileHref}
                    onClick={onMobileNavigate}
                    className="flex cursor-pointer items-center gap-2 w-full px-2 py-1.5 text-sm"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg flex items-center gap-2 px-2 py-1.5 text-sm"
                  onClick={() => void signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4 -scale-x-100" />
                  <span>Çıkış yap</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}
