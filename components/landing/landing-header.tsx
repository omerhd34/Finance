/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
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
              variant="ghost"
              asChild
              className="px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground hover:bg-accent hover:text-foreground shrink-0"
            >
              <Link href="/login">Giriş</Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="h-8 sm:h-9 px-3 sm:px-5 text-xs sm:text-sm bg-emerald-500 shadow-md shadow-emerald-900/40 transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-900/50 rounded-full font-semibold shrink-0"
            >
              <Link href="/register">Ücretsiz Başla</Link>
            </Button>
          </nav>
        </div>

        <div className="sm:hidden flex w-full justify-end px-3 pb-1.5">
          <Button
            type="button"
            variant="ghost"
            onClick={toggleTheme}
            disabled={!themeReady}
            className="flex items-center justify-center h-8 w-8 rounded-full 
             bg-emerald-500/10 border border-emerald-500/20 
             hover:bg-emerald-500/20 hover:border-emerald-500/40 
             transition-all duration-300 shadow-sm shadow-emerald-500/5 
             p-0 aspect-square"
          >
            {themeResolved && resolvedTheme === "dark" ? (
              <Moon className="h-4 w-4 text-emerald-400" />
            ) : (
              <Sun className="h-4 w-4 text-emerald-600" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
