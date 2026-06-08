/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Lightbulb, LightbulbOff } from "lucide-react";
import { useTheme } from "@wrksz/themes/client";

export function LandingHeaderThemeToggle() {
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
    <button
      type="button"
      disabled={!themeReady}
      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground transition hover:bg-accent hover:text-foreground sm:h-10 sm:w-10 disabled:opacity-60"
      aria-label={themeLabel}
      title={themeLabel}
      onClick={toggleTheme}
    >
      {themeResolved && resolvedTheme === "dark" ? (
        <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
      ) : (
        <LightbulbOff className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
      )}
    </button>
  );
}
