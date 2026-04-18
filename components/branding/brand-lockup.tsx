"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLockupVariant = "landing" | "sidebar";

const variantStyles: Record<
  BrandLockupVariant,
  {
    wrapper: string;
    iconWrap: string;
    icon: string;
    textWrap: string;
    iq: string;
    finans: string;
    ai: string;
  }
> = {
  landing: {
    wrapper: "gap-2 sm:gap-3 group cursor-pointer shrink-0",
    iconWrap:
      "hidden sm:block relative overflow-hidden rounded-xl ring-1 ring-emerald-500/20 bg-white/50 shadow-sm transition-all duration-500 group-hover:ring-emerald-500/50 group-hover:shadow-lg group-hover:shadow-emerald-500/20 dark:bg-white/5 dark:ring-emerald-400/20 dark:group-hover:ring-emerald-400/40 shrink-0",
    icon: "h-11 w-11 object-cover transition-transform duration-500 group-hover:scale-110",
    textWrap:
      "inline-flex items-baseline text-xl sm:text-2xl font-bold tracking-tight antialiased whitespace-nowrap",
    iq: "bg-linear-to-br from-emerald-800 to-green-600 bg-clip-text text-transparent font-extrabold drop-shadow-sm dark:from-emerald-400 dark:to-lime-300 dark:drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]",
    finans:
      "text-zinc-800 transition-colors duration-300 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white",
    ai: "ml-1.5 sm:ml-2 relative top-[-1px] sm:top-[-2px] inline-flex items-center rounded-md sm:rounded-lg border border-emerald-600/30 bg-linear-to-b from-emerald-100/90 to-emerald-50/90 px-1.5 sm:px-2 py-0.5 text-[0.55em] sm:text-[0.45em] font-extrabold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-500 group-hover:border-emerald-500/60 group-hover:bg-emerald-200/90 group-hover:text-emerald-950 dark:border-emerald-400/20 dark:from-emerald-400/10 dark:to-emerald-500/5 dark:text-emerald-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_10px_rgba(52,211,153,0.05)] dark:group-hover:border-emerald-300/40 dark:group-hover:from-emerald-300/30 dark:group-hover:to-emerald-400/10 dark:group-hover:text-white!",
  },
  sidebar: {
    wrapper: "gap-2.5 group cursor-pointer",
    iconWrap:
      "shrink-0 relative overflow-hidden rounded-lg ring-1 ring-emerald-500/20 bg-white/50 shadow-sm transition-all duration-500 group-hover:ring-emerald-500/50 group-hover:shadow-md group-hover:shadow-emerald-500/20 dark:bg-white/5 dark:ring-emerald-400/20 dark:group-hover:ring-emerald-400/40",
    icon: "h-10 w-10 object-cover transition-transform duration-500 group-hover:scale-110",
    textWrap:
      "min-w-0 flex-1 truncate text-[1.35rem] font-bold tracking-tight antialiased",
    iq: "bg-linear-to-br from-emerald-800 to-green-600 bg-clip-text text-transparent font-extrabold drop-shadow-sm dark:from-emerald-400 dark:to-lime-300 dark:drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]",
    finans:
      "text-zinc-800 transition-colors duration-300 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white",
    ai: "ml-1.5 relative top-[-1px] inline-flex items-center rounded-md border border-emerald-600/30 bg-linear-to-b from-emerald-100/90 to-emerald-50/90 px-1.5 py-[0.15rem] text-[0.45em] font-extrabold uppercase tracking-[0.2em] text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-500 group-hover:border-emerald-500/60 group-hover:bg-emerald-200/90 group-hover:text-emerald-950 dark:border-emerald-400/20 dark:from-emerald-400/10 dark:to-emerald-500/5 dark:text-emerald-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] dark:group-hover:border-emerald-300/40 dark:group-hover:from-emerald-300/25 dark:group-hover:to-emerald-400/10 dark:group-hover:text-white!",
  },
};

export function BrandLockup({
  variant,
  className,
}: {
  variant: BrandLockupVariant;
  className?: string;
}) {
  const styles = variantStyles[variant];

  return (
    <div className={cn("flex min-w-0 items-center", styles.wrapper, className)}>
      <div className={styles.iconWrap}>
        <Image
          src="/FinansIQ-192.png"
          alt="IQfinansAI Logosu"
          width={44}
          height={44}
          className={styles.icon}
          priority
        />
      </div>
      <div className={styles.textWrap}>
        <span className={styles.iq}>IQ</span>
        <span className={styles.finans}>finans</span>
        <span className={styles.ai}>AI</span>
      </div>
    </div>
  );
}
