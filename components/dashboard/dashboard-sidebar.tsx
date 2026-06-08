"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogOut, User, MoreVertical } from "lucide-react";
import { BrandLockup } from "@/components/branding/brand-lockup";
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
  currency: string;
  currencySaving: boolean;
  profileHref: string;
  sessionUserPresent: boolean;
  onCurrencyChange: (next: string) => void;
  userImage?: string | null;
};

export function DashboardSidebar({
  collapsed,
  isMobile = false,
  pathname,
  onMobileNavigate,
  profileHref,
  userImage,
}: DashboardSidebarProps) {
  const { data: session } = useSession();
  const { unreadCount } = useNotificationUnreadCount();

  const [userToggledHrefs, setUserToggledHrefs] = useState<
    Record<string, boolean>
  >({});

  const expandedHrefs: Record<string, boolean> = {};
  for (const navItem of dashboardNav) {
    if (navItem.children?.length) {
      const isActive =
        pathname === navItem.href || pathname.startsWith(`${navItem.href}/`);
      const override = userToggledHrefs[navItem.href];
      expandedHrefs[navItem.href] = override ?? isActive;
    }
  }

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
      <div
        className={cn(
          "flex w-full shrink-0 items-center justify-center py-4",
          collapsed ? "px-2" : "px-4",
        )}
      >
        <Link
          href="/gosterge-paneli"
          onClick={onMobileNavigate}
          className="inline-flex min-w-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Ana panele git"
          title="Ana panel"
        >
          <BrandLockup
            variant="sidebar"
            collapsed={collapsed && !isMobile}
            className={cn(
              collapsed && !isMobile ? "scale-100" : "min-w-0 gap-1.5",
            )}
          />
        </Link>
      </div>

      <Separator className="bg-foreground/10 dark:bg-border" />

      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-1",
          collapsed ? "p-2 pt-3" : "p-3 pt-3",
        )}
      >
        {dashboardNav.flatMap(({ href, label, icon: Icon, children }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const hasChildren = !!children?.length;
          const isExpanded = hasChildren && !collapsed && !!expandedHrefs[href];

          const item = (
            <div key={href}>
              <div className="relative">
                <Link
                  href={href}
                  onClick={onMobileNavigate}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-colors",
                    collapsed
                      ? "justify-center px-2 py-2.5"
                      : "gap-3 px-3 py-2",
                    hasChildren && !collapsed && "pr-10",
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
                  {!collapsed && <span className="flex-1">{label}</span>}
                  {href === "/bildirimler" &&
                    !collapsed &&
                    notificationBadge("expanded")}
                </Link>

                {hasChildren && !collapsed && (
                  <button
                    type="button"
                    onClick={() =>
                      setUserToggledHrefs((prev) => ({
                        ...prev,
                        [href]: !expandedHrefs[href],
                      }))
                    }
                    aria-expanded={isExpanded}
                    aria-label={
                      isExpanded
                        ? `${label} alt menüsünü kapat`
                        : `${label} alt menüsünü aç`
                    }
                    className={cn(
                      "absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded-md transition-colors",
                      active
                        ? "text-primary hover:bg-primary/10"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExpanded && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                )}
              </div>

              {hasChildren && !collapsed && (
                <div
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                    isExpanded
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                  aria-hidden={!isExpanded}
                >
                  <div className="overflow-hidden">
                    <ul className="mt-1 ml-5.5 flex flex-col gap-0.5 border-l border-border/60 pl-2 pb-1">
                      {children!.map(
                        ({
                          href: childHref,
                          label: childLabel,
                          icon: ChildIcon,
                        }) => {
                          const childActive = pathname === childHref;
                          return (
                            <li key={childHref}>
                              <Link
                                href={childHref}
                                onClick={onMobileNavigate}
                                tabIndex={isExpanded ? 0 : -1}
                                className={cn(
                                  "group/sub relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                                  childActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                                )}
                              >
                                <ChildIcon
                                  className={cn(
                                    "h-4 w-4 shrink-0 transition-colors",
                                    childActive
                                      ? "text-primary"
                                      : "text-muted-foreground/80 group-hover/sub:text-foreground",
                                  )}
                                  aria-hidden
                                />
                                <span className="truncate">{childLabel}</span>
                              </Link>
                            </li>
                          );
                        },
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );

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
        })}
      </nav>

      <div className="mt-auto" />

      <Separator className="bg-foreground/10 dark:bg-border" />

      {collapsed ? (
        <div className="py-4 flex justify-center">
          {" "}
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
          <div className="flex items-center gap-2 rounded-xl p-1.5 text-left bg-transparent">
            <Link
              href={profileHref}
              onClick={onMobileNavigate}
              title="Profilime git"
              className="flex items-center gap-2 flex-1 min-w-0 rounded-lg -m-1 p-1 cursor-pointer hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
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
            </Link>

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
