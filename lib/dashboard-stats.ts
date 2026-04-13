import type { Transaction } from "@/types/transaction";
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { tr } from "date-fns/locale";

export type MonthlyBarRow = {
  key: string;
  label: string;
  gelir: number;
  gider: number;
};

export function lastNMonthsBars(
  transactions: Transaction[],
  n: number,
  now: Date = new Date(),
): MonthlyBarRow[] {
  const start = startOfMonth(subMonths(now, n - 1));
  const end = endOfMonth(now);
  const months = eachMonthOfInterval({ start, end });
  return months.map((m) => {
    const ms = startOfMonth(m).getTime();
    const me = endOfMonth(m).getTime();
    let gelir = 0;
    let gider = 0;
    for (const t of transactions) {
      const d = new Date(t.date).getTime();
      if (d < ms || d > me) continue;
      if (t.type === "income") gelir += t.amount;
      else gider += t.amount;
    }
    return {
      key: format(m, "yyyy-MM"),
      label: format(m, "MMM", { locale: tr }),
      gelir,
      gider,
    };
  });
}

export type CategorySlice = { name: string; value: number };

export function expenseByCategoryForMonth(
  transactions: Transaction[],
  ref: Date = new Date(),
): CategorySlice[] {
  const ms = startOfMonth(ref).getTime();
  const me = endOfMonth(ref).getTime();
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const d = new Date(t.date).getTime();
    if (d < ms || d > me) continue;
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

export function sumByType(
  transactions: Transaction[],
  type: "income" | "expense",
): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((a, t) => a + t.amount, 0);
}

export function sumExpenseInRange(
  transactions: Transaction[],
  start: Date,
  end: Date,
): number {
  const s = start.getTime();
  const e = end.getTime();
  let total = 0;
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const d = new Date(t.date).getTime();
    if (d >= s && d <= e) total += t.amount;
  }
  return total;
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}
