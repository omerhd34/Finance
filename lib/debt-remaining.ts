import type { Debt } from "@/types/debt";

export function debtRemaining(d: Debt): number {
  return Math.max(0, d.totalAmount - d.paidAmount);
}
