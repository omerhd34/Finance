export type DebtSyncTransactionsSlice = {
  syncTransactions?: boolean | null;
};

export function shouldSyncDebtTransactions(
  debt: DebtSyncTransactionsSlice,
): boolean {
  return debt.syncTransactions !== false;
}
