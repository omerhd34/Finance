"use client";

import type { CSSProperties } from "react";
import { useTheme } from "@wrksz/themes/client";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "dark"}
      className="toaster group"
      position="top-center"
      offset={88}
      mobileOffset={88}
      visibleToasts={3}
      gap={12}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--toast-padding-inline": "20px",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group/toast pointer-events-auto !min-w-[320px] sm:!min-w-[380px] !rounded-2xl !p-5 !pr-12 !gap-4 !shadow-2xl !shadow-black/15 dark:!shadow-black/45 ring-1 ring-black/5 dark:ring-white/5 backdrop-blur-md",
          title: "!text-base !font-semibold !leading-tight !tracking-tight",
          description: "!mt-1.5 !text-sm !leading-relaxed !text-current/75",
          icon: "shrink-0 !mt-0.5 [&>svg]:!h-5.5 [&>svg]:!w-5.5",
          closeButton:
            "!left-auto !right-3 !top-3 !h-7 !w-7 !rounded-full !border !border-border/60 !bg-background/80 hover:!bg-accent hover:!text-foreground",
          success:
            "!bg-emerald-50 !text-emerald-950 !border-emerald-500/40 dark:!bg-emerald-950/80 dark:!text-emerald-50 dark:!border-emerald-400/40 [&_[data-icon]>svg]:!text-emerald-600 dark:[&_[data-icon]>svg]:!text-emerald-400",
          error:
            "!bg-rose-50 !text-rose-950 !border-rose-500/40 dark:!bg-rose-950/80 dark:!text-rose-50 dark:!border-rose-400/40 [&_[data-icon]>svg]:!text-rose-600 dark:[&_[data-icon]>svg]:!text-rose-400",
        },
      }}
      {...props}
    />
  );
}
