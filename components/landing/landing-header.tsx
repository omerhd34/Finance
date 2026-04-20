/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, Moon, Sun } from "lucide-react";
import { useTheme } from "@wrksz/themes/client";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/branding/brand-lockup";

export function LandingHeader() {
  const { setTheme, resolvedTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  const themeResolved =
    themeReady && (resolvedTheme === "light" || resolvedTheme === "dark");

  useEffect(() => {
    setThemeReady(true);
  }, []);

  const toggleTheme = () => {
    const current = resolvedTheme ?? "dark";
    setTheme(current === "dark" ? "light" : "dark");
  };

  const themeLabel = themeResolved
    ? resolvedTheme === "dark"
      ? "Açık temaya geç"
      : "Koyu temaya geç"
    : "Tema";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/60 bg-slate-100/95 backdrop-blur-xl dark:bg-[#050507]/95">
      <div className="mx-auto flex flex-col sm:flex-row max-w-7xl items-center justify-between">
        <div className="flex w-full items-center justify-between h-14 sm:h-16 px-3 sm:px-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-lg sm:text-xl font-semibold tracking-tight text-foreground shrink-0"
          >
            <BrandLockup variant="landing" />
          </Link>

          <nav
            className="flex items-center gap-1.5 sm:gap-3"
            aria-label="Giriş navigasyonu"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!themeReady}
              className="hidden sm:flex h-9 w-9 cursor-pointer rounded-full border border-border/70 bg-background/70 text-muted-foreground transition hover:bg-accent hover:text-foreground shrink-0"
              aria-label={themeLabel}
              title={themeLabel}
              onClick={toggleTheme}
            >
              {themeResolved && resolvedTheme === "dark" ? (
                <Moon className="h-4.5 w-4.5" />
              ) : (
                <Sun className="h-4.5 w-4.5" />
              )}
            </Button>
            <Button
              variant="outline"
              asChild
              size="sm"
              className="h-8 shrink-0 gap-1.5 rounded-full border-slate-300/90 bg-white/50 px-3 text-xs font-semibold shadow-sm transition-all duration-200 hover:border-emerald-500/65 hover:bg-emerald-500/15 hover:text-emerald-900 hover:shadow-md hover:shadow-emerald-500/15 active:scale-[0.98] sm:h-9 sm:px-4 sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/50 dark:bg-white/95 dark:text-zinc-900 dark:hover:border-emerald-400/60 dark:hover:bg-emerald-50 dark:hover:text-emerald-950 dark:hover:shadow-lg dark:hover:shadow-emerald-950/25 active:dark:scale-[0.98] dark:focus-visible:ring-emerald-400/50 dark:focus-visible:ring-offset-[#050507]"
            >
              <Link
                href="/giris"
                className="group inline-flex items-center gap-1.5"
              >
                <LogIn
                  className="h-3.5 w-3.5 opacity-80 transition-colors group-hover:text-emerald-800 group-hover:opacity-100 sm:h-4 sm:w-4 dark:group-hover:text-emerald-900"
                  aria-hidden
                />
                Giriş
              </Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="h-8 shrink-0 rounded-full bg-emerald-500 px-3 text-xs font-semibold text-white shadow-md shadow-emerald-900/40 transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-900/50 sm:h-9 sm:px-5 sm:text-sm dark:bg-emerald-500 dark:text-white dark:shadow-emerald-950/50 dark:hover:bg-emerald-400 dark:hover:text-white"
            >
              <Link href="/kayit">Ücretsiz Başla</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
