import type { Transaction } from "@/types/transaction";

function dayKey(date: string | Date): string {
  if (typeof date === "string") return date.slice(0, 10);
  return new Date(date).toISOString().slice(0, 10);
}

export type DedupeTxRow = {
  id: string;
  recurringSlotKey?: string | null;
  date: Date | string;
  amount: number;
  category: string;
  description: string | null;
};

function dedupeKey(t: DedupeTxRow): string {
  if (t.recurringSlotKey) {
    return `slot:${t.recurringSlotKey}`;
  }
  if (t.description?.startsWith("[Tekrarlayan]")) {
    return `legacy:${dayKey(t.date)}|${t.amount}|${t.category}|${t.description}`;
  }
  return `id:${t.id}`;
}

export function dedupeTransactionRows<T extends DedupeTxRow>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const t of items) {
    const k = dedupeKey(t);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out;
}

export function dedupeTransactionsForDisplay(
  items: Transaction[],
): Transaction[] {
  return dedupeTransactionRows(items);
}
