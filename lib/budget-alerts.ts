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
  emailNotificationsEnabled: boolean;
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
    emailNotificationsEnabled,
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

  if (emailNotificationsEnabled && emailAlertsEnabled && userEmail) {
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

async function createAlertWithRollback(opts: {
  budgetId: string;
  monthKey: string;
  alertType: typeof THRESHOLD | typeof EXCEEDED;
  createPayload: {
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
    emailNotificationsEnabled: boolean;
  };
}): Promise<void> {
  const inserted = await insertAlertLogOrSkip({
    budgetId: opts.budgetId,
    monthKey: opts.monthKey,
    alertType: opts.alertType,
  });
  if (!inserted) return;

  try {
    await createNotificationAndMaybeEmail(opts.createPayload);
  } catch (error) {
    await prisma.budgetAlertLog.deleteMany({
      where: {
        budgetId: opts.budgetId,
        monthKey: opts.monthKey,
        alertType: opts.alertType,
      },
    });
    throw error;
  }
}

async function hasBudgetNotification(opts: {
  userId: string;
  alertType: typeof THRESHOLD | typeof EXCEEDED;
  budgetId: string;
  monthKey: string;
}): Promise<boolean> {
  const type =
    opts.alertType === EXCEEDED ? "budget_exceeded" : "budget_threshold";
  const row = await notification.findFirst({
    where: {
      userId: opts.userId,
      type,
      AND: [
        { metadata: { path: "$.budgetId", equals: opts.budgetId } },
        { metadata: { path: "$.monthKey", equals: opts.monthKey } },
        { metadata: { path: "$.alertType", equals: opts.alertType } },
      ],
    },
    select: { id: true },
  });
  return Boolean(row);
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
    select: {
      email: true,
      currency: true,
      notificationsEnabled: true,
    } as { email: true; currency: true; notificationsEnabled: true },
  });
  if (!user) return;

  const emailNotificationsEnabled = user.notificationsEnabled !== false;

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
  const hasExceededNotification = hasExceeded
    ? await hasBudgetNotification({
        userId,
        alertType: EXCEEDED,
        budgetId: budget.id,
        monthKey: mk,
      })
    : false;
  const hasThresholdNotification = hasThreshold
    ? await hasBudgetNotification({
        userId,
        alertType: THRESHOLD,
        budgetId: budget.id,
        monthKey: mk,
      })
    : false;

  if (spent >= limit) {
    if (!hasExceeded) {
      await createAlertWithRollback({
        budgetId: budget.id,
        monthKey: mk,
        alertType: EXCEEDED,
        createPayload: {
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
          emailNotificationsEnabled,
        },
      });
    } else if (!hasExceededNotification) {
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
        emailNotificationsEnabled,
      });
    }
    return;
  }

  if (spent >= thresholdAmount) {
    if (!hasThreshold) {
      await createAlertWithRollback({
        budgetId: budget.id,
        monthKey: mk,
        alertType: THRESHOLD,
        createPayload: {
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
          emailNotificationsEnabled,
        },
      });
    } else if (!hasThresholdNotification) {
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
        emailNotificationsEnabled,
      });
    }
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
