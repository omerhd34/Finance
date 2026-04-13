import type { Debt } from "@/types/debt";

export function debtRemaining(d: Debt): number {
  return Math.max(0, d.totalAmount - d.paidAmount);
}

export function debtProgressPercent(d: Debt): number {
  if (d.totalAmount <= 0) return 0;
  return Math.min(100, (d.paidAmount / d.totalAmount) * 100);
}
