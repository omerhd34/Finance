/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@wrksz/themes/client";
import { Button } from "@/components/ui/button";

export function LandingFooter() {
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

  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/70 bg-background/85 py-10 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 sm:flex-row sm:px-6">
        <p className="text-sm text-muted-foreground/90">
          © {year}{" "}
          <span className="font-semibold text-foreground">FinansIQ</span>. Tüm
          hakları saklıdır.
        </p>
        <nav
          className="flex flex-wrap items-center justify-center gap-4 text-sm"
          aria-label="Alt bağlantılar"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!themeReady}
            className="h-8 w-8 cursor-pointer rounded-full border border-border/70 bg-background/70 text-muted-foreground transition hover:bg-accent hover:text-foreground"
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
                <Moon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground opacity-60" />
            )}
          </Button>
          <Link
            href="/login"
            className="rounded-full px-2 py-1 text-muted-foreground transition hover:bg-accent/70 hover:text-foreground"
          >
            Giriş
          </Link>
          <Link
            href="/register"
            className="rounded-full px-2 py-1 font-medium text-emerald-500 transition hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            Kayıt ol
          </Link>
        </nav>
      </div>
    </footer>
  );
}
