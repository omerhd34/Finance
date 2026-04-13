import type { Goal } from "@/types/goal";

export function goalProgressPercent(g: Goal): number {
  if (g.targetAmount <= 0) return 0;
  return Math.min(100, (g.currentAmount / g.targetAmount) * 100);
}

export function goalProgressIndicatorClassName(pct: number): string {
  if (pct <= 33) return "bg-red-500";
  if (pct <= 66) return "bg-yellow-500";
  return "bg-emerald-500";
}
