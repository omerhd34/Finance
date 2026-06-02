import {
  addMonths,
  endOfDay,
  format,
  isBefore,
  startOfDay,
  subDays,
  subMonths,
} from "date-fns";

const DEFAULT_MONTH_START_DAY = 1;

export function clampMonthStartDay(value: number | null | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_MONTH_START_DAY;
  return Math.min(28, Math.max(1, Math.trunc(n)));
}

export function getBillingPeriodForDate(
  anchor: Date,
  monthStartDay: number | null | undefined,
): { start: Date; end: Date; monthKey: string } {
  const day = clampMonthStartDay(monthStartDay);
  const candidate = startOfDay(
    new Date(anchor.getFullYear(), anchor.getMonth(), day),
  );
  const periodStart = isBefore(anchor, candidate)
    ? subMonths(candidate, 1)
    : candidate;
  const periodEnd = endOfDay(subDays(addMonths(periodStart, 1), 1));
  return {
    start: periodStart,
    end: periodEnd,
    monthKey: format(periodStart, "yyyy-MM"),
  };
}
