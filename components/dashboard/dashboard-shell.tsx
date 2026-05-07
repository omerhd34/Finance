"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "@wrksz/themes/client";
import { apiClient } from "@/lib/client/api-client";
import { normalizeUserCurrency } from "@/lib/common/currency";
import { normalizePlanTier } from "@/lib/premium/plan-tier";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardShellHeader } from "@/components/dashboard/dashboard-shell-header";
import {
  DASHBOARD_PAGE_PAD_X,
  DASHBOARD_PAGE_PAD_Y,
  profileInitials,
  SIDEBAR_COLLAPSED_KEY,
  type ProfilePatchResponse,
} from "@/components/dashboard/dashboard-shell-constants";
import { cn } from "@/lib/common/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reduxUserName = useAppSelector((s) => s.auth.user?.name);
  const reduxUserEmail = useAppSelector((s) => s.auth.user?.email);
  const reduxUserImage = useAppSelector((s) => s.auth.user?.image);
  const authUser = useAppSelector((s) => s.auth.user);
  const { data: session, update: updateSession } = useSession();
  const sidebarAvatarSrc = reduxUserImage ?? session?.user?.image ?? undefined;
  const sidebarFallbackInitials = profileInitials(
    reduxUserName ?? session?.user?.name ?? null,
    reduxUserEmail ?? session?.user?.email ?? "?",
  );
  const { setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [currencySaving, setCurrencySaving] = useState(false);
  const currency = normalizeUserCurrency(
    authUser?.currency ?? session?.user?.currency ?? "TL",
  );

  const toggleTheme = () => {
    const current = resolvedTheme ?? "dark";
    setTheme(current === "dark" ? "light" : "dark");
  };

  const themeResolved =
    themeReady && (resolvedTheme === "light" || resolvedTheme === "dark");

  const profileHref = session?.user?.id
    ? `/profil/${session.user.id}`
    : "/profil";

  useEffect(() => {
    setThemeReady(true);
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        setSidebarCollapsed(
          localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1",
        );
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  function toggleSidebarCollapsed() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  async function onSidebarCurrencyChange(nextRaw: string) {
    if (!session?.user?.id) return;
    const next = normalizeUserCurrency(nextRaw);
    if (next === currency) return;
    setCurrencySaving(true);
    try {
      const { data } = await apiClient.patch<ProfilePatchResponse>(
        "/api/user/profile",
        { currency: next },
      );
      dispatch(
        setUser({
          id: session.user.id,
          name: data.name,
          email: data.email,
          image: data.image ?? null,
          currency: data.currency,
          phone: data.phone ?? null,
          profession: data.profession ?? null,
          city: data.city ?? null,
          country: data.country ?? null,
          monthStartDay: data.monthStartDay ?? 1,
          notificationsEnabled: data.notificationsEnabled !== false,
          planTier: normalizePlanTier(data.planTier),
        }),
      );
      await updateSession({
        name: data.name ?? session.user.name ?? "",
        profession: data.profession ?? null,
        city: data.city ?? null,
        country: data.country ?? null,
        monthStartDay: data.monthStartDay ?? 1,
        currency: normalizeUserCurrency(data.currency),
        phone: data.phone ?? null,
        email: data.email,
        image: data.image ?? null,
        notificationsEnabled: data.notificationsEnabled !== false,
        reloadUser: true,
      } as Record<string, unknown>);
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setCurrencySaving(false);
    }
  }

  const sidebarProps = {
    pathname,
    onMobileNavigate: () => setOpen(false),
    onToggleCollapsed: toggleSidebarCollapsed,
    currency,
    currencySaving,
    profileHref,
    sidebarAvatarSrc,
    sidebarFallbackInitials,
    userDisplayName: session?.user?.name ?? "Kullanıcı",
    userEmail: session?.user?.email,
    sessionUserPresent: !!session?.user,
    onCurrencyChange: onSidebarCurrencyChange,
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <DashboardShellHeader
        menuOpen={open}
        onMenuToggle={() => setOpen((prev) => !prev)}
        themeReady={themeReady}
        themeResolved={themeResolved}
        resolvedTheme={resolvedTheme}
        onToggleTheme={toggleTheme}
      />
      <div className="relative flex min-h-0 min-w-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="flex min-h-full min-w-0 flex-row items-stretch">
              <aside
                dir="ltr"
                className={cn(
                  "sticky top-0 hidden h-[calc(100dvh-3.5rem)] shrink-0 self-start flex-col overflow-y-auto border-r border-border bg-sidebar lg:flex",
                  sidebarCollapsed ? "w-18" : "w-64",
                )}
              >
                <DashboardSidebar
                  collapsed={sidebarCollapsed}
                  {...sidebarProps}
                />
              </aside>
              <main
                className={cn(
                  "min-w-0 flex-1 bg-background",
                  DASHBOARD_PAGE_PAD_X,
                  DASHBOARD_PAGE_PAD_Y,
                )}
              >
                {children}
              </main>
            </div>
          </div>
        </div>
        {open && (
          <div className="fixed inset-x-0 bottom-0 top-14 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              aria-label="Menüyü kapat"
              onClick={() => setOpen(false)}
            />
            <div
              dir="ltr"
              className="absolute left-0 top-0 flex h-full w-[min(100%,18rem)] flex-col border-r border-border bg-sidebar shadow-xl"
            >
              <DashboardSidebar collapsed={false} isMobile {...sidebarProps} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
