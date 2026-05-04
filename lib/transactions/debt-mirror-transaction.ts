import type { Transaction } from "@/types/transaction";
import { PAYABLE_DEBT_CATEGORY } from "@/lib/debts/payable-expense-sync";

const RECEIVABLE_INCOME_CATEGORY = "Alacak";

export function isDebtMirrorTransaction(
  t: Pick<Transaction, "debtId" | "type" | "category">,
): boolean {
  if (t.debtId) return true;
  if (t.type === "income" && t.category === RECEIVABLE_INCOME_CATEGORY)
    return true;
  if (t.type === "expense" && t.category === PAYABLE_DEBT_CATEGORY) return true;
  return false;
}
