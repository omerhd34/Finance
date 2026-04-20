"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Banknote,
  Bell,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PieChart,
  PiggyBank,
  Settings,
  Sparkles,
  Sun,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useTheme } from "@wrksz/themes/client";
import { normalizeUserCurrency } from "@/lib/currency";
import { normalizePlanTier } from "@/lib/plan-tier";
import { apiClient } from "@/lib/api-client";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { NotificationsPopover } from "@/components/notifications/notifications-popover";
import { BrandLockup } from "@/components/branding/brand-lockup";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SIDEBAR_COLLAPSED_KEY = "iqfinansai-sidebar-collapsed";

const nav = [
  { href: "/gosterge-paneli", label: "Ana Panel", icon: LayoutDashboard },
  { href: "/islemler", label: "İşlemler", icon: Wallet },
  { href: "/tekrarlayanlar", label: "Tekrarlayan", icon: CalendarClock },
  { href: "/hedefler", label: "Hedefler", icon: PiggyBank },
  { href: "/butceler", label: "Bütçeler", icon: PieChart },
  { href: "/borc-ve-alacak", label: "Borç ve Alacak", icon: HandCoins },
  { href: "/yatirimlar", label: "Yatırım", icon: TrendingUp },
  { href: "/yapay-zeka-analizi", label: "AI Analiz", icon: Sparkles },
  { href: "/bildirimler", label: "Bildirimler", icon: Bell },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

const titles: Record<string, string> = {
  "/gosterge-paneli": "Ana Panel",
  "/islemler": "İşlemler",
  "/islemler/yeni-islem": "Yeni İşlem",
  "/tekrarlayanlar": "Tekrarlayan işlemler",
  "/hedefler": "Hedefler",
  "/butceler": "Kategori bütçeleri",
  "/borc-ve-alacak": "Borç ve Alacak",
  "/yatirimlar": "Yatırım",
  "/yapay-zeka-analizi": "AI Analiz",
  "/bildirimler": "Bildirimler",
  "/ayarlar": "Ayarlar",
};

function titleForPath(path: string): string {
  if (titles[path]) return titles[path];
  const prefix = Object.keys(titles)
    .filter((k) => k !== "/gosterge-paneli")
    .sort((a, b) => b.length - a.length)
    .find((k) => path.startsWith(k));
  return prefix ? (titles[prefix] ?? "IQfinansAI") : "IQfinansAI";
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session, update: updateSession } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [currencySaving, setCurrencySaving] = useState(false);
  const title = titleForPath(pathname);

  const toggleTheme = () => {
    const current = resolvedTheme ?? "dark";
    setTheme(current === "dark" ? "light" : "dark");
  };

  const themeResolved =
    themeReady && (resolvedTheme === "light" || resolvedTheme === "dark");

  const sidebarCurrency = normalizeUserCurrency(
    (session?.user as { currency?: string })?.currency,
  );

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

  async function onSidebarCurrencyChange(value: string) {
    if (!session?.user?.id) return;
    const currency = normalizeUserCurrency(value);
    setCurrencySaving(true);
    try {
      const { data } = await apiClient.patch<{
        name: string | null;
        email: string;
        phone: string | null;
        currency: string;
        notificationsEnabled: boolean;
        planTier: string;
        image: string | null;
      }>("/api/user/profile", { currency });
      dispatch(
        setUser({
          id: session.user.id,
          name: data.name,
          email: data.email,
          image: session.user.image ?? null,
          currency: data.currency,
          phone: data.phone ?? null,
          notificationsEnabled: data.notificationsEnabled !== false,
          planTier: normalizePlanTier(data.planTier),
        }),
      );
      await updateSession({
        currency: normalizeUserCurrency(data.currency),
        phone: data.phone ?? null,
        name: data.name ?? "",
        email: data.email,
        notificationsEnabled: data.notificationsEnabled !== false,
        reloadUser: true,
      } as Record<string, unknown>);
      router.refresh();
    } finally {
      setCurrencySaving(false);
    }
  }

  function renderSidebar(collapsed: boolean, isMobile: boolean = false) {
    return (
      <>
        {collapsed ? (
          <div className="flex shrink-0 flex-col items-center gap-2 border-b border-border py-3">
            <Link
              href="/gosterge-paneli"
              onClick={() => setOpen(false)}
              className="overflow-hidden rounded-xl ring-1 ring-emerald-500/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Ana panele git"
              title="Ana panel"
            >
              <Image
                src="/FinansIQ-192.png"
                alt="IQfinansAI logosu"
                width={36}
                height={36}
                className="h-9 w-9 object-cover"
                priority
              />
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 cursor-pointer"
              onClick={toggleSidebarCollapsed}
              aria-label="Kenar çubuğunu genişlet"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
            <Link
              href="/gosterge-paneli"
              onClick={() => setOpen(false)}
              className="flex min-w-0 flex-1 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Ana panele git"
              title="Ana panel"
            >
              <BrandLockup variant="sidebar" className="min-w-0 w-full" />
            </Link>
            {isMobile ? (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 cursor-pointer"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hidden shrink-0 cursor-pointer lg:inline-flex"
                onClick={toggleSidebarCollapsed}
                aria-label="Kenar çubuğunu daralt"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
        <nav
          className={cn(
            "flex flex-1 flex-col gap-1",
            collapsed ? "p-2" : "p-3",
          )}
        >
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-colors",
                  collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>
        {collapsed ? (
          <div className="mt-auto flex flex-col items-center gap-2 border-t border-border p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 cursor-pointer rounded-lg border border-border/70 bg-muted/25"
                  disabled={currencySaving || !session?.user}
                  title="Para birimi"
                >
                  <Banknote className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" sideOffset={8}>
                <DropdownMenuItem
                  onClick={() => void onSidebarCurrencyChange("TL")}
                >
                  TL (₺)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void onSidebarCurrencyChange("USD")}
                >
                  USD ($)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void onSidebarCurrencyChange("EUR")}
                >
                  EUR (€)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void onSidebarCurrencyChange("GBP")}
                >
                  GBP (£)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href="/ayarlar"
              onClick={() => setOpen(false)}
              className="flex justify-center rounded-lg bg-muted/30 p-1.5"
              title="Ayarlar"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={session?.user?.image ?? undefined} alt="" />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {(session?.user?.name ?? session?.user?.email ?? "?")
                    .slice(0, 2)
                    .toUpperCase()}
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
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="sidebar-currency"
                  className="text-xs text-muted-foreground"
                >
                  Para birimi
                </Label>
                <Select
                  value={sidebarCurrency}
                  onValueChange={(v) => void onSidebarCurrencyChange(v)}
                  disabled={currencySaving || !session?.user}
                >
                  <SelectTrigger
                    id="sidebar-currency"
                    className={cn(
                      "h-9 w-full rounded-lg border-border/70 bg-muted/25 text-sm shadow-none",
                    )}
                  >
                    <SelectValue placeholder="Para birimi" />
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
            </div>
            <div className="border-t border-border p-3">
              <Link
                href="/ayarlar"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={session?.user?.image ?? undefined} alt="" />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {(session?.user?.name ?? session?.user?.email ?? "?")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {session?.user?.name ?? "Kullanıcı"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </Link>
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full cursor-pointer justify-start gap-3 rounded-lg border-destructive/25 bg-destructive/6 px-3 py-2.5 text-sm font-medium text-destructive shadow-none transition-colors hover:border-destructive/45 hover:bg-destructive/15 hover:text-destructive"
                onClick={() => void signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4 shrink-0 -scale-x-100" aria-hidden />
                Çıkış yap
              </Button>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      <aside
        className={cn(
          "hidden h-full min-h-0 shrink-0 flex-col overflow-y-auto border-r border-border bg-sidebar lg:flex",
          sidebarCollapsed ? "w-18" : "w-64",
        )}
      >
        {renderSidebar(sidebarCollapsed)}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-sidebar shadow-xl">
            {renderSidebar(false, true)}
          </div>
        </div>
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Menü"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="truncate text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsPopover />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!themeReady}
              className="cursor-pointer"
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
              onClick={toggleTheme}
            >
              {themeResolved ? (
                resolvedTheme === "dark" ? (
                  <Moon className="h-5 w-5 text-muted-foreground " />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground opacity-60" />
              )}
            </Button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
