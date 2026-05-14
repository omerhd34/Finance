import type { Transaction } from "@/types/transaction";
import {
  addMonths,
  endOfDay,
  endOfMonth,
  format,
  isBefore,
  startOfMonth,
  startOfDay,
  subMonths,
} from "date-fns";
import { tr } from "date-fns/locale";

export type MonthlyBarRow = {
  key: string;
  label: string;
  gelir: number;
  gider: number;
};

export type CategorySlice = { name: string; value: number };

function resolveCompletedPeriodEnd(now: Date, monthStartDay: number): Date {
  const currentPeriodStart = startOfDay(
    new Date(now.getFullYear(), now.getMonth(), monthStartDay),
  );
  return isBefore(now, currentPeriodStart)
    ? subMonths(currentPeriodStart, 1)
    : currentPeriodStart;
}

export function getLastNMonthsPeriodRange(
  n: number,
  now: Date = new Date(),
  monthStartDay = 1,
): { start: Date; end: Date } {
  const safeN = Math.max(1, Math.trunc(n));
  const safeMonthStartDay = Math.min(
    28,
    Math.max(1, Math.trunc(monthStartDay)),
  );
  const currentPeriodStart = resolveCompletedPeriodEnd(now, safeMonthStartDay);
  const start = subMonths(currentPeriodStart, safeN - 1);
  const end = endOfDay(now);
  return { start, end };
}

/**
 * Ay başlangıç gününde "Son 1 ay" penceresi tek güne düştüğünde kategori gider
 * pastası boş kalmasın diye: aynı günde henüz gider yoksa 2 ay; o gün için
 * en az bir gider varsa 1 ay önerilir (gelir tek başına pastayı doldurmaz).
 */
export function recommendedCategoryPieMonths(
  transactions: Transaction[],
  now: Date = new Date(),
  monthStartDay = 1,
): 1 | 2 {
  const { start, end } = getLastNMonthsPeriodRange(1, now, monthStartDay);
  if (startOfDay(start).getTime() !== startOfDay(end).getTime()) {
    return 1;
  }
  const s = start.getTime();
  const e = end.getTime();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const d = new Date(t.date).getTime();
    if (d >= s && d <= e) return 1;
  }
  return 2;
}

export function formatPeriodRangeLabel(
  start: Date,
  end: Date,
  locale = "tr-TR",
): string {
  const includeYear = start.getFullYear() !== end.getFullYear();
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    ...(includeYear ? { year: "numeric" } : {}),
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function formatLastNMonthsPeriodRangeLabel(
  n: number,
  now: Date = new Date(),
  monthStartDay = 1,
  locale = "tr-TR",
): string {
  const safeN = Math.max(1, Math.trunc(n));
  const { start: periodAnchor } = getLastNMonthsPeriodRange(
    1,
    now,
    monthStartDay,
  );
  if (safeN === 1) {
    const endLabel = addMonths(periodAnchor, 1);
    return formatPeriodRangeLabel(periodAnchor, endLabel, locale);
  }
  const left = subMonths(periodAnchor, safeN);
  return formatPeriodRangeLabel(left, periodAnchor, locale);
}

export function lastNMonthsBars(
  transactions: Transaction[],
  n: number,
  now: Date = new Date(),
  monthStartDay = 1,
): MonthlyBarRow[] {
  const safeN = Math.max(1, Math.trunc(n));
  const { start: rangeStart, end: rangeEnd } = getLastNMonthsPeriodRange(
    safeN,
    now,
    monthStartDay,
  );
  const periods = Array.from({ length: safeN }, (_, i) => {
    const start = addMonths(rangeStart, i);
    const end = i === safeN - 1 ? rangeEnd : addMonths(rangeStart, i + 1);
    return { start, end, isLast: i === safeN - 1 };
  });

  return periods.map((period) => {
    const startMs = period.start.getTime();
    const endMs = period.end.getTime();
    let gelir = 0;
    let gider = 0;
    for (const t of transactions) {
      const d = new Date(t.date).getTime();
      if (period.isLast) {
        if (d < startMs || d > endMs) continue;
      } else if (d < startMs || d >= endMs) continue;
      if (t.type === "income") gelir += t.amount;
      else gider += t.amount;
    }
    return {
      key: format(period.start, "yyyy-MM-dd"),
      label: format(period.start, "MMMM", { locale: tr }),
      gelir,
      gider,
    };
  });
}

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

export function expenseByCategoryForLastNMonths(
  transactions: Transaction[],
  n: number,
  now: Date = new Date(),
  monthStartDay = 1,
): CategorySlice[] {
  const { start: periodStart, end: rangeEnd } = getLastNMonthsPeriodRange(
    n,
    now,
    monthStartDay,
  );
  const s = periodStart.getTime();
  const e = rangeEnd.getTime();
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const d = new Date(t.date).getTime();
    if (d < s || d > e) continue;
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

export function sumByTypeInRange(
  transactions: Transaction[],
  type: "income" | "expense",
  start: Date,
  end: Date,
): number {
  const s = start.getTime();
  const e = end.getTime();
  let total = 0;
  for (const t of transactions) {
    if (t.type !== type) continue;
    const d = new Date(t.date).getTime();
    if (d >= s && d <= e) total += t.amount;
  }
  return total;
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
