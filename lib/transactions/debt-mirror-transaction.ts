import type { Transaction } from "@/types/transaction";
import { isReceivableLendingExpense } from "@/lib/debts/receivable-lending-sync";
import { isPayableBorrowingIncome } from "@/lib/debts/payable-borrowing-sync";

const RECEIVABLE_INCOME_CATEGORY = "Alacak";

export function isDebtMirrorTransaction(
  t: Pick<Transaction, "debtId" | "type" | "category" | "subcategory">,
): boolean {
  if (t.debtId) return true;
  if (t.type === "income" && t.category === RECEIVABLE_INCOME_CATEGORY)
    return true;
  if (isReceivableLendingExpense(t.type, t.category)) {
    return true;
  }
  if (isPayableBorrowingIncome(t.type, t.category)) {
    return true;
  }
  return false;
}
