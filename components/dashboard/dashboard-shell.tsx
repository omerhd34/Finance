"use client";

import { useEffect, useLayoutEffect, useState } from "react";
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
import { DashboardEmailVerificationBanner } from "@/components/dashboard/dashboard-email-verification-banner";
import { DataLoadingProvider } from "@/components/ui/data-loading-context";
import {
  DASHBOARD_PAGE_PAD_X,
  DASHBOARD_PAGE_PAD_Y,
  type ProfilePatchResponse,
} from "@/components/dashboard/dashboard-shell-constants";
import { cn } from "@/lib/common/utils";
import {
  persistSidebarCollapsed,
  readSidebarCollapsedFromStorage,
} from "@/lib/dashboard/sidebar-preference";

export function DashboardShell({
  children,
  initialSidebarCollapsed = false,
}: {
  children: React.ReactNode;
  initialSidebarCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s) => s.auth.user);
  const { data: session, update: updateSession } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    initialSidebarCollapsed,
  );
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

  useLayoutEffect(() => {
    const fromStorage = readSidebarCollapsedFromStorage();
    if (fromStorage === null) {
      persistSidebarCollapsed(initialSidebarCollapsed);
      return;
    }

    setSidebarCollapsed((current) => {
      if (fromStorage === current) return current;
      persistSidebarCollapsed(fromStorage);
      return fromStorage;
    });
  }, [initialSidebarCollapsed]);

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
      persistSidebarCollapsed(next);
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
    sessionUserPresent: !!session?.user,
    onCurrencyChange: onSidebarCurrencyChange,
    themeReady,
    themeResolved,
    resolvedTheme,
    onToggleTheme: toggleTheme,
  };

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      <aside
        dir="ltr"
        data-dashboard-sidebar
        className={cn(
          "hidden h-dvh min-h-0 shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-border bg-sidebar lg:flex lg:flex-col",
          sidebarCollapsed ? "w-18" : "w-64",
        )}
      >
        <DashboardSidebar collapsed={sidebarCollapsed} {...sidebarProps} />
      </aside>
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardShellHeader
          menuOpen={open}
          onMenuToggle={() => setOpen((prev) => !prev)}
        />
        <main
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background",
            DASHBOARD_PAGE_PAD_X,
            DASHBOARD_PAGE_PAD_Y,
          )}
        >
          <DataLoadingProvider>
            <DashboardEmailVerificationBanner className="mb-6 md:mb-8" />
            {children}
          </DataLoadingProvider>
        </main>
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
