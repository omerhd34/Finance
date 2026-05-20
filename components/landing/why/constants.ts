import type { LandingWhyAccent } from "@/components/landing/why/content";

export const accentBlobs: Record<LandingWhyAccent, string> = {
  emerald: "bg-emerald-500/20",
  violet: "bg-violet-500/20",
  amber: "bg-amber-500/20",
  sky: "bg-sky-500/20",
  rose: "bg-rose-500/20",
};

export const gridSlotClasses: Record<string, string> = {
  "finance-management":
    "lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:self-stretch",
  "budget-planning":
    "lg:col-span-5 lg:col-start-6 lg:row-start-1 lg:self-stretch",

  "cost-control": "lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-stretch",
  "transaction-categories":
    "lg:col-span-5 lg:col-start-6 lg:row-start-2 lg:self-stretch",

  "ai-automation":
    "lg:col-span-5 lg:col-start-1 lg:row-start-3 lg:self-stretch",
  "investment-portfolio":
    "lg:col-span-5 lg:col-start-6 lg:row-start-3 lg:self-stretch",

  "financial-calculations":
    "lg:col-span-5 lg:col-start-1 lg:row-start-4 lg:self-stretch",
};
