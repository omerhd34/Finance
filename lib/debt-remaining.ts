import type { Debt } from "@/types/debt";

export type DebtAmountSlice = Pick<Debt, "totalAmount" | "paidAmount">;

export function debtRemaining(d: DebtAmountSlice): number {
  return Math.max(0, d.totalAmount - d.paidAmount);
}

export function debtProgressPercent(d: DebtAmountSlice): number {
  if (d.totalAmount <= 0) return 0;
  return Math.min(100, (d.paidAmount / d.totalAmount) * 100);
}
