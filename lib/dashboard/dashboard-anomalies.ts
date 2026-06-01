import { subMonths } from "date-fns";
import type { Debt } from "@/types/debt";
import type { Transaction } from "@/types/transaction";
import { debtRemaining } from "@/lib/debts/debt-remaining";
import { isTryAssetUnit } from "@/lib/debts/debt-asset-units";
import { formatExpenseCategoryLabel } from "@/lib/domain/categories";
import { formatMoneyAmount } from "@/lib/common/utils";
import {
  getLastNMonthsPeriodRange,
  sumByTypeInRange,
} from "@/lib/dashboard/dashboard-stats";

export type DashboardAlertSeverity = "info" | "warning" | "danger";

export type DashboardAlert = {
  id: string;
  severity: DashboardAlertSeverity;
  title: string;
  description: string;
  href: string;
  hrefLabel: string;
};

export type CategoryBudgetSnapshot = {
  id: string;
  category: string;
  monthlyLimit: number;
  alertThresholdPercent: number;
  spentThisMonth: number;
};

const ANOMALY_MIN_DELTA_TRY = 250;
const ANOMALY_MIN_RATIO = 1.5;
const ANOMALY_LOOKBACK_PERIODS = 3;

const SPIKE_DANGER_PERCENT = 200;
const SPIKE_WARNING_PERCENT = 100;

const DEBT_DANGER_DAYS = 0;
const DEBT_WARNING_DAYS = 3;
const DEBT_INFO_DAYS = 14;

const CASHFLOW_INFO_RATIO = 0.85;
const CASHFLOW_WARNING_RATIO = 0.95;
const CASHFLOW_DANGER_RATIO = 1.3;

const BUDGET_INFO_RATIO = 0.6;

const SEVERITY_ORDER: Record<DashboardAlertSeverity, number> = {
  danger: 0,
  warning: 1,
  info: 2,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(a: Date, b: Date): number {
  const diff = a.getTime() - b.getTime();
  return Math.floor(diff / MS_PER_DAY);
}

function expenseTotalsByCategory(
  items: Transaction[],
  start: Date,
  end: Date,
): Map<string, { total: number; lastSubcategory: string | null }> {
  const s = start.getTime();
  const e = end.getTime();
  const map = new Map<
    string,
    { total: number; lastSubcategory: string | null }
  >();
  for (const t of items) {
    if (t.type !== "expense") continue;
    const d = new Date(t.date).getTime();
    if (d < s || d > e) continue;
    const prev = map.get(t.category) ?? { total: 0, lastSubcategory: null };
    prev.total += t.amount;
    if (!prev.lastSubcategory && t.subcategory)
      prev.lastSubcategory = t.subcategory;
    map.set(t.category, prev);
  }
  return map;
}

export function detectCategorySpikeAlerts(
  items: Transaction[],
  now: Date,
  monthStartDay: number,
  currency: string,
): DashboardAlert[] {
  const { start: currentStart, end: currentEnd } = getLastNMonthsPeriodRange(
    1,
    now,
    monthStartDay,
  );
  const currentTotals = expenseTotalsByCategory(
    items,
    currentStart,
    currentEnd,
  );
  if (currentTotals.size === 0) return [];

  const lookbackStart = subMonths(currentStart, ANOMALY_LOOKBACK_PERIODS);
  const priorTotals = expenseTotalsByCategory(
    items,
    lookbackStart,
    currentStart,
  );

  const alerts: DashboardAlert[] = [];
  for (const [category, { total, lastSubcategory }] of currentTotals) {
    const priorTotal = priorTotals.get(category)?.total ?? 0;
    const priorAverage = priorTotal / ANOMALY_LOOKBACK_PERIODS;
    if (priorAverage <= 0) continue;
    const delta = total - priorAverage;
    if (delta < ANOMALY_MIN_DELTA_TRY) continue;
    const ratio = total / priorAverage;
    if (ratio < ANOMALY_MIN_RATIO) continue;
    const percent = Math.round((ratio - 1) * 100);
    const label = formatExpenseCategoryLabel(category, lastSubcategory);
    const severity: DashboardAlertSeverity =
      percent >= SPIKE_DANGER_PERCENT
        ? "danger"
        : percent >= SPIKE_WARNING_PERCENT
          ? "warning"
          : "info";
    alerts.push({
      id: `spike-${category}`,
      severity,
      title: `${label} harcamanız %${percent} arttı.`,
      description: `Bu dönem ${formatMoneyAmount(
        total,
        currency,
      )}, önceki ${ANOMALY_LOOKBACK_PERIODS} dönem ortalaması ${formatMoneyAmount(
        priorAverage,
        currency,
      )}.`,
      href: `/islemler?category=${encodeURIComponent(category)}&type=expense`,
      hrefLabel: "Detayı gör.",
    });
  }
  alerts.sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      a.title.localeCompare(b.title, "tr"),
  );
  return alerts;
}

export function detectBudgetAlerts(
  budgets: CategoryBudgetSnapshot[],
  currency: string,
): DashboardAlert[] {
  if (!budgets.length) return [];
  const alerts: DashboardAlert[] = [];
  for (const b of budgets) {
    if (b.monthlyLimit <= 0) continue;
    const ratio = b.spentThisMonth / b.monthlyLimit;
    const threshold = b.alertThresholdPercent / 100;
    if (ratio >= 1) {
      alerts.push({
        id: `budget-exceed-${b.id}`,
        severity: "danger",
        title: `Bütçe aşıldı: ${b.category}`,
        description: `Aylık limit ${formatMoneyAmount(
          b.monthlyLimit,
          currency,
        )}, bu ay harcadığınız ${formatMoneyAmount(
          b.spentThisMonth,
          currency,
        )} (%${Math.round(ratio * 100)}).`,
        href: "/butceler",
        hrefLabel: "Bütçeyi düzenle",
      });
    } else if (ratio >= threshold) {
      alerts.push({
        id: `budget-threshold-${b.id}`,
        severity: "warning",
        title: `Bütçe uyarısı: ${b.category}`,
        description: `Limitin %${Math.round(
          ratio * 100,
        )} düzeyine ulaştınız (${formatMoneyAmount(
          b.spentThisMonth,
          currency,
        )} / ${formatMoneyAmount(b.monthlyLimit, currency)}).`,
        href: "/butceler",
        hrefLabel: "Bütçeyi gör",
      });
    } else if (ratio >= BUDGET_INFO_RATIO) {
      alerts.push({
        id: `budget-info-${b.id}`,
        severity: "info",
        title: `Bütçeye yaklaşıyor: ${b.category}`,
        description: `Limitin %${Math.round(
          ratio * 100,
        )} düzeyindesiniz (${formatMoneyAmount(
          b.spentThisMonth,
          currency,
        )} / ${formatMoneyAmount(b.monthlyLimit, currency)}).`,
        href: "/butceler",
        hrefLabel: "Bütçeyi gör",
      });
    }
  }
  return alerts;
}

export function detectDebtAlerts(
  debts: Debt[],
  now: Date,
  currency: string,
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  for (const d of debts) {
    if (!d.dueDate) continue;
    if (!isTryAssetUnit(d.assetUnit)) continue;
    const remaining = debtRemaining(d);
    if (remaining <= 0) continue;
    const due = new Date(d.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = daysBetween(due, today);
    const isReceivable = d.direction === "RECEIVABLE";
    const counterparty =
      d.counterparty.trim() || (isReceivable ? "Alacak" : "Borç");

    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      alerts.push({
        id: `debt-overdue-${d.id}`,
        severity: "danger",
        title: isReceivable
          ? `Gecikmiş alacak: ${counterparty}`
          : `Gecikmiş borç: ${counterparty}`,
        description: `${overdueDays} gün gecikti — kalan ${formatMoneyAmount(
          remaining,
          currency,
        )}.`,
        href: "/borc-ve-alacak",
        hrefLabel: isReceivable ? "Tahsilatı planla" : "Ödemeyi planla",
      });
    } else if (diffDays <= DEBT_WARNING_DAYS) {
      alerts.push({
        id: `debt-soon-${d.id}`,
        severity: "warning",
        title: isReceivable
          ? `Yakın vadeli alacak: ${counterparty}`
          : `Yakın vadeli borç: ${counterparty}`,
        description: `${
          diffDays === DEBT_DANGER_DAYS ? "Bugün" : `${diffDays} gün içinde`
        } — kalan ${formatMoneyAmount(remaining, currency)}.`,
        href: "/borc-ve-alacak",
        hrefLabel: "Detayı gör",
      });
    } else if (diffDays <= DEBT_INFO_DAYS) {
      alerts.push({
        id: `debt-info-${d.id}`,
        severity: "info",
        title: isReceivable
          ? `Yaklaşan alacak: ${counterparty}`
          : `Yaklaşan borç: ${counterparty}`,
        description: `${diffDays} gün içinde — kalan ${formatMoneyAmount(
          remaining,
          currency,
        )}.`,
        href: "/borc-ve-alacak",
        hrefLabel: "Detayı gör",
      });
    }
  }
  return alerts;
}

export function detectLowCashFlowAlert(
  items: Transaction[],
  now: Date,
  monthStartDay: number,
  currency: string,
): DashboardAlert | null {
  const { start, end } = getLastNMonthsPeriodRange(1, now, monthStartDay);
  const expense = sumByTypeInRange(items, "expense", start, end);
  const income = sumByTypeInRange(items, "income", start, end);
  if (income === 0) return null;
  const ratio = expense / income;
  if (ratio < CASHFLOW_INFO_RATIO) return null;
  const severity: DashboardAlertSeverity =
    ratio >= CASHFLOW_DANGER_RATIO
      ? "danger"
      : ratio >= CASHFLOW_WARNING_RATIO
        ? "warning"
        : "info";
  const isOverspend = ratio > 1;
  const percentLabel = Math.round(ratio * 100);
  return {
    id: "cashflow-warning",
    severity,
    title: isOverspend
      ? "Bu dönemde gelirinizi aştınız."
      : "Tasarruf payınız azalıyor.",
    description: isOverspend
      ? `Gider/gelir oranı %${percentLabel}. Bu dönem ${formatMoneyAmount(
          expense - income,
          currency,
        )} ek harcama yaptınız.`
      : `Gider/gelir oranı %${percentLabel}. Tasarruf marjınız ${formatMoneyAmount(
          income - expense,
          currency,
        )} ile daraldı.`,
    href: "/islemler",
    hrefLabel: "İşlemleri incele.",
  };
}

export function buildDashboardAlerts(opts: {
  items: Transaction[];
  debts: Debt[];
  budgets: CategoryBudgetSnapshot[];
  now: Date;
  monthStartDay: number;
  currency: string;
}): DashboardAlert[] {
  const { items, debts, budgets, now, monthStartDay, currency } = opts;
  const all: DashboardAlert[] = [];
  const cashflow = detectLowCashFlowAlert(items, now, monthStartDay, currency);
  if (cashflow) all.push(cashflow);
  all.push(...detectBudgetAlerts(budgets, currency));
  all.push(...detectDebtAlerts(debts, now, currency));
  all.push(...detectCategorySpikeAlerts(items, now, monthStartDay, currency));
  return all.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );
}
