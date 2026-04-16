/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@wrksz/themes/client";
import { Button } from "@/components/ui/button";

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

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-xl font-semibold tracking-tight text-foreground"
        >
          <span className="overflow-hidden rounded-xl ring-1 ring-emerald-500/20 transition group-hover:ring-emerald-500/40">
            <Image
              src="/FinansIQ-192.png"
              alt="IQfinansAI logosu"
              width={44}
              height={44}
              className="h-11 w-11 object-cover"
              priority
            />
          </span>
          <span className="text-foreground transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
            IQfinansAI
          </span>
        </Link>
        <nav
          className="flex items-center gap-2 sm:gap-3"
          aria-label="Ana navigasyon"
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
          <Button
            variant="ghost"
            asChild
            className="text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Link href="/login">Giriş</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-emerald-500 shadow-md shadow-emerald-900/40 transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-900/50 rounded-full px-5 font-semibold"
          >
            <Link href="/register" className="text-black! dark:text-white!">
              Ücretsiz Başla
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
