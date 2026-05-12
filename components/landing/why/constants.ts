import type { LandingWhyAccent } from "@/components/landing/why/content";

export const landingWhyEyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-white/80 px-3.5 py-1 text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase shadow-sm ring-1 ring-emerald-500/20 backdrop-blur-sm dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";

export const accentBlobs: Record<LandingWhyAccent, string> = {
  emerald: "bg-emerald-500/20",
  violet: "bg-violet-500/20",
  amber: "bg-amber-500/20",
  sky: "bg-sky-500/20",
  rose: "bg-rose-500/20",
};

export const gridSlotClasses: Record<string, string> = {
  "finance-management": "md:col-start-1 md:row-start-1 md:row-span-2",
  "cost-control": "md:col-start-3 md:row-start-1",
  "ai-automation": "md:col-start-3 md:row-start-2 md:row-span-2",
  "investment-portfolio":
    "md:col-span-2 md:col-start-1 md:row-start-3 md:self-start",
};

export const middleColumnCardIds = [
  "budget-planning",
  "transaction-categories",
] as const;
