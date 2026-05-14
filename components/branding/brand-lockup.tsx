"use client";

import { cn } from "@/lib/common/utils";

type BrandLockupVariant = "landing" | "sidebar";

const variantStyles: Record<
  BrandLockupVariant,
  {
    wrapper: string;
    textWrap: string;
    iq: string;
    finans: string;
    ai: string;
  }
> = {
  landing: {
    wrapper: "gap-2 sm:gap-3 group cursor-pointer shrink-0",
    textWrap:
      "inline-flex items-baseline text-xl sm:text-2xl font-bold tracking-tight antialiased whitespace-nowrap",
    iq: "bg-linear-to-br from-emerald-800 to-green-600 bg-clip-text text-transparent font-extrabold drop-shadow-sm dark:from-emerald-400 dark:to-lime-300 dark:drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]",
    finans:
      "text-zinc-800 transition-colors duration-300 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white",
    ai: "ml-1.5 sm:ml-2 relative top-[-1px] sm:top-[-2px] inline-flex items-center rounded-md sm:rounded-lg border border-emerald-600/30 bg-linear-to-b from-emerald-100/90 to-emerald-50/90 px-1.5 sm:px-2 py-0.5 text-[0.55em] sm:text-[0.45em] font-extrabold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-500 group-hover:border-emerald-500/60 group-hover:bg-emerald-200/90 group-hover:text-emerald-950 dark:border-emerald-400/20 dark:from-emerald-400/10 dark:to-emerald-500/5 dark:text-emerald-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_10px_rgba(52,211,153,0.05)] dark:group-hover:border-emerald-300/40 dark:group-hover:from-emerald-300/30 dark:group-hover:to-emerald-400/10 dark:group-hover:!text-white",
  },
  sidebar: {
    wrapper: "gap-2.5 group shrink-0",
    textWrap:
      "inline-flex min-w-0 max-w-full items-baseline whitespace-nowrap text-[1.35rem] font-bold tracking-tight antialiased",
    iq: "bg-linear-to-br from-emerald-800 to-green-600 bg-clip-text text-transparent font-extrabold drop-shadow-sm dark:from-emerald-400 dark:to-lime-300 dark:drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]",
    finans:
      "text-zinc-800 transition-colors duration-300 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white",
    ai: "ml-1.5 relative top-[-1px] inline-flex items-center rounded-md border border-emerald-600/30 bg-linear-to-b from-emerald-100/90 to-emerald-50/90 px-1.5 py-[0.15rem] text-[0.45em] font-extrabold uppercase tracking-[0.2em] text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-500 group-hover:border-emerald-500/60 group-hover:bg-emerald-200/90 group-hover:text-emerald-950 dark:border-emerald-400/20 dark:from-emerald-400/10 dark:to-emerald-500/5 dark:text-emerald-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] dark:group-hover:border-emerald-300/40 dark:group-hover:from-emerald-300/25 dark:group-hover:to-emerald-400/10 dark:group-hover:!text-white",
  },
};

export function BrandLockup({
  variant,
  className,
  finansClassName,
  collapsed = false,
}: {
  variant: BrandLockupVariant;
  className?: string;
  finansClassName?: string;
  collapsed?: boolean;
}) {
  const styles = variantStyles[variant];

  if (variant === "sidebar" && collapsed) {
    return (
      <div
        translate="no"
        lang="en"
        className={cn(
          "notranslate group relative flex h-11 w-11 shrink-0 cursor-pointer select-none flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-linear-to-br from-emerald-800 via-emerald-950 to-[#021510] shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-lime-400/30 hover:shadow-[0_0_15px_rgba(163,230,53,0.2)]",
          className,
        )}
        aria-hidden
      >
        <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-linear-to-r from-transparent via-lime-200/30 to-transparent" />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.15),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative flex flex-col items-center justify-center gap-[2px]">
          <span className="bg-linear-to-b from-lime-50 via-lime-200 to-emerald-500 bg-clip-text text-[1.15rem] font-black leading-none tracking-tight text-transparent drop-shadow-[0_0_8px_rgba(163,230,53,0.3)]">
            IQ
          </span>
          <span className="rounded-[4px] border border-lime-400/30 bg-linear-to-b from-white/10 to-emerald-900/50 px-[5px] py-[1.5px] text-[0.45rem] font-extrabold uppercase leading-none tracking-wide text-lime-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm">
            AI
          </span>
        </div>
      </div>
    );
  }
  return (
    <div
      translate="no"
      lang="en"
      className={cn(
        "notranslate flex min-w-0 items-center select-none",
        styles.wrapper,
        className,
      )}
    >
      <div className={styles.textWrap}>
        <span className={styles.iq}>IQ</span>
        <span className={cn(styles.finans, finansClassName)}>finans</span>
        <span className={styles.ai}>AI</span>
      </div>
    </div>
  );
}
