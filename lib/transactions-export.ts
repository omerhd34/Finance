import type { Transaction } from "@/types/transaction";
import { apiClient } from "@/lib/api-client";
import { dedupeTransactionsForDisplay } from "@/lib/dedupe-transactions-display";
import { currencySymbolLabel, formatDateShort } from "@/lib/utils";
import type { TransactionFilters } from "@/store/slices/transactionSlice";
import { downloadTransactionsPdf } from "@/lib/export-transactions-pdf";

export async function fetchTransactionsForExport(
  filters: TransactionFilters,
): Promise<Transaction[]> {
  const p = new URLSearchParams();
  if (filters.type) p.set("type", filters.type);
  if (filters.category) p.set("category", filters.category);
  if (filters.dateFrom) p.set("from", filters.dateFrom);
  if (filters.dateTo) p.set("to", filters.dateTo);
  if (filters.search.trim()) p.set("search", filters.search.trim());
  p.set("limit", "2000");
  const { data } = await apiClient.get<{ items: Transaction[] }>(
    `/api/transactions?${p.toString()}`,
  );
  return dedupeTransactionsForDisplay(data.items);
}

export function downloadTransactionsCsv(
  rows: Transaction[],
  currency: string,
): void {
  const sep = ";";
  const q = (value: string) => {
    if (!/[;\r\n"]/.test(value)) return value;
    return `"${value.replace(/"/g, '""')}"`;
  };
  const header = [
    "Tarih",
    "Kategori",
    "Açıklama",
    `Tutar (${currencySymbolLabel(currency)})`,
    "Tür",
  ];
  const brandRow = ["IQfinansAI", "", "", "", ""].join(sep);
  const lines = [
    brandRow,
    header.join(sep),
    ...rows.map((t) =>
      [
        formatDateShort(t.date),
        q(t.category),
        q(t.description ?? ""),
        String(t.amount),
        t.type === "income" ? "Gelir" : "Gider",
      ].join(sep),
    ),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `islemler-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadTransactionsPdfFiltered(
  rows: Transaction[],
  currency: string,
): Promise<void> {
  const name = `islemler-${new Date().toISOString().slice(0, 10)}.pdf`;
  await downloadTransactionsPdf(rows, currency, name);
}
