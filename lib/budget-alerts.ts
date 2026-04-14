import { endOfMonth, format, startOfMonth } from "date-fns";
import { tr } from "date-fns/locale";
import { Prisma as PrismaClient } from "@prisma/client";
import { dedupeTransactionRows } from "@/lib/dedupe-transactions-display";
import { buildBudgetAlertEmailHtml } from "@/lib/budget-alert-email-template";
import { sendBudgetAlertEmail } from "@/lib/budget-alert-email";
import {
  budgetAlertLog,
  categoryBudget,
  notification,
  prisma,
} from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

const THRESHOLD = "THRESHOLD" as const;
const EXCEEDED = "EXCEEDED" as const;

function isUniqueViolation(e: unknown): boolean {
  return (
    e instanceof PrismaClient.PrismaClientKnownRequestError &&
    e.code === "P2002"
  );
}

async function insertAlertLogOrSkip(data: {
  budgetId: string;
  monthKey: string;
  alertType: string;
}): Promise<boolean> {
  try {
    await budgetAlertLog.create({ data });
    return true;
  } catch (e) {
    if (isUniqueViolation(e)) return false;
    throw e;
  }
}

function monthKeyFromDate(d: Date): string {
  return format(d, "yyyy-MM");
}

function monthRange(d: Date): { start: Date; end: Date } {
  return {
    start: startOfMonth(d),
    end: endOfMonth(d),
  };
}

export async function getExpenseTotalForCategoryMonth(
  userId: string,
  category: string,
  monthAnchor: Date,
): Promise<number> {
  const { start, end } = monthRange(monthAnchor);
  return sumExpenseForCategoryMonth(userId, category, start, end);
}

async function sumExpenseForCategoryMonth(
  userId: string,
  category: string,
  start: Date,
  end: Date,
): Promise<number> {
  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      type: "expense",
      category,
      date: { gte: start, lte: end },
    },
    select: {
      id: true,
      recurringSlotKey: true,
      date: true,
      amount: true,
      category: true,
      description: true,
    },
  });
  const deduped = dedupeTransactionRows(rows);
  return deduped.reduce((acc, t) => acc + t.amount, 0);
}

async function createNotificationAndMaybeEmail(opts: {
  userId: string;
  userEmail: string;
  currency: string;
  budgetId: string;
  category: string;
  monthKey: string;
  spent: number;
  monthlyLimit: number;
  alertType: typeof THRESHOLD | typeof EXCEEDED;
  emailAlertsEnabled: boolean;
  thresholdPercent: number;
}): Promise<void> {
  const {
    userId,
    userEmail,
    currency,
    budgetId,
    category,
    monthKey,
    spent,
    monthlyLimit,
    alertType,
    emailAlertsEnabled,
    thresholdPercent,
  } = opts;

  const monthLabel = format(new Date(`${monthKey}-01T12:00:00`), "MMMM yyyy", {
    locale: tr,
  });

  let title: string;
  let body: string;
  if (alertType === EXCEEDED) {
    title = `Bütçe aşıldı: ${category}`;
    body = `${monthLabel} içinde ${category} harcamanız ${formatMoney(spent, currency)}; aylık limit ${formatMoney(monthlyLimit, currency)}.`;
  } else {
    title = `Bütçe uyarısı: ${category}`;
    body = `${monthLabel} içinde ${category} harcamanız limitin %${Math.round(thresholdPercent)} düzeyine ulaştı (${formatMoney(spent, currency)} / ${formatMoney(monthlyLimit, currency)}).`;
  }

  await notification.create({
    data: {
      userId,
      type: alertType === EXCEEDED ? "budget_exceeded" : "budget_threshold",
      title,
      body,
      metadata: {
        budgetId,
        category,
        monthKey,
        spent,
        monthlyLimit,
        alertType,
      },
    },
  });

  if (emailAlertsEnabled && userEmail) {
    const spentFormatted = formatMoney(spent, currency);
    const limitFormatted = formatMoney(monthlyLimit, currency);
    const progressPercent =
      monthlyLimit > 0
        ? Math.min(100, Math.round((spent / monthlyLimit) * 100))
        : 0;
    const html = buildBudgetAlertEmailHtml({
      alertType: alertType === EXCEEDED ? "exceeded" : "threshold",
      monthLabel,
      category,
      spentFormatted,
      limitFormatted,
      thresholdPercent,
      progressPercent,
    });
    await sendBudgetAlertEmail({
      to: userEmail,
      subject: title,
      html,
    });
  }
}

export async function evaluateCategoryBudgetForMonth(
  userId: string,
  category: string,
  monthAnchor: Date,
): Promise<void> {
  const budget = await categoryBudget.findUnique({
    where: {
      userId_category: { userId, category },
    },
  });
  if (!budget) return;

  const { start, end } = monthRange(monthAnchor);
  const mk = monthKeyFromDate(monthAnchor);
  const spent = await sumExpenseForCategoryMonth(userId, category, start, end);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, currency: true },
  });
  if (!user) return;

  const currency = user.currency ?? "TL";
  const limit = budget.monthlyLimit;
  if (limit <= 0) return;

  const thresholdAmount = limit * (budget.alertThresholdPercent / 100);

  const existing = await budgetAlertLog.findMany({
    where: { budgetId: budget.id, monthKey: mk },
  });
  const hasThreshold = existing.some(
    (x: { alertType: string }) => x.alertType === THRESHOLD,
  );
  const hasExceeded = existing.some(
    (x: { alertType: string }) => x.alertType === EXCEEDED,
  );

  if (spent >= limit && !hasExceeded) {
    const inserted = await insertAlertLogOrSkip({
      budgetId: budget.id,
      monthKey: mk,
      alertType: EXCEEDED,
    });
    if (!inserted) return;
    await createNotificationAndMaybeEmail({
      userId,
      userEmail: user.email,
      currency,
      budgetId: budget.id,
      category,
      monthKey: mk,
      spent,
      monthlyLimit: limit,
      alertType: EXCEEDED,
      emailAlertsEnabled: budget.emailAlertsEnabled,
      thresholdPercent: budget.alertThresholdPercent,
    });
    return;
  }

  if (spent >= thresholdAmount && !hasThreshold) {
    const inserted = await insertAlertLogOrSkip({
      budgetId: budget.id,
      monthKey: mk,
      alertType: THRESHOLD,
    });
    if (!inserted) return;
    await createNotificationAndMaybeEmail({
      userId,
      userEmail: user.email,
      currency,
      budgetId: budget.id,
      category,
      monthKey: mk,
      spent,
      monthlyLimit: limit,
      alertType: THRESHOLD,
      emailAlertsEnabled: budget.emailAlertsEnabled,
      thresholdPercent: budget.alertThresholdPercent,
    });
  }
}

export async function evaluateCategoryBudgetsForTransactionContext(opts: {
  userId: string;
  type: string;
  category: string;
  date: Date;
}): Promise<void> {
  if (opts.type !== "expense") return;
  await evaluateCategoryBudgetForMonth(opts.userId, opts.category, opts.date);
}
