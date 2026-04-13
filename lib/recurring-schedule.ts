import { addMonths, addWeeks, addYears, endOfDay, startOfDay } from "date-fns";

export const RECURRING_FREQUENCIES = ["WEEKLY", "MONTHLY", "YEARLY"] as const;
export type RecurringFrequency = (typeof RECURRING_FREQUENCIES)[number];

export const RECURRING_MODES = ["AUTO", "REMINDER"] as const;
export type RecurringMode = (typeof RECURRING_MODES)[number];

export function normalizeDueDate(d: Date): Date {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    12,
    0,
    0,
    0,
  );
}

export function addRecurringInterval(
  from: Date,
  frequency: RecurringFrequency,
  interval: number,
): Date {
  const n = Math.max(1, Math.floor(interval));
  switch (frequency) {
    case "WEEKLY":
      return addWeeks(from, n);
    case "MONTHLY":
      return addMonths(from, n);
    case "YEARLY":
      return addYears(from, n);
    default:
      return addMonths(from, n);
  }
}

export function endOfToday(): Date {
  return endOfDay(new Date());
}

export function isDueOrOverdue(due: Date, nowEnd: Date): boolean {
  return normalizeDueDate(due) <= nowEnd;
}

export function isWithinRuleEnd(cursor: Date, endDate: Date | null): boolean {
  if (!endDate) return true;
  return normalizeDueDate(cursor) <= endOfDay(endDate);
}

export function alignNextDueToFuture(
  anchor: Date,
  frequency: RecurringFrequency,
  interval: number,
  notBefore: Date,
): Date {
  let d = normalizeDueDate(anchor);
  const limit = startOfDay(notBefore);
  let guard = 0;
  while (normalizeDueDate(d) < limit && guard < 600) {
    d = addRecurringInterval(d, frequency, interval);
    guard++;
  }
  return d;
}
