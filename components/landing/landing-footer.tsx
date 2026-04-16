/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@wrksz/themes/client";
import { Button } from "@/components/ui/button";

export function LandingFooter() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/95 py-10 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 sm:flex-row sm:px-6">
        <p className="text-sm text-muted-foreground">
          © {year}{" "}
          <span className="font-semibold tracking-tight text-foreground">
            IQfinansAI
          </span>
          . Tüm hakları saklıdır.
        </p>

        <nav
          className="flex items-center gap-4 text-sm"
          aria-label="Alt bağlantılar"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!mounted}
            onClick={toggleTheme}
            className="h-8 w-8 rounded-full border border-border/30 bg-background/50 text-muted-foreground transition hover:bg-accent hover:text-foreground cursor-pointer"
            aria-label="Tema değiştir"
            title="Tema değiştir"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
            )}
          </Button>

          <div className="mx-1 h-4 w-px bg-border/50" aria-hidden="true" />

          <Link
            href="/login"
            className="font-medium text-muted-foreground transition hover:text-foreground"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-emerald-500/10 px-4 py-1.5 font-medium text-emerald-600 transition hover:bg-emerald-500/20 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-400/10"
          >
            Kayıt Ol
          </Link>
        </nav>
      </div>
    </footer>
  );
}
