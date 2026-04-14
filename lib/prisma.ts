import { PrismaClient } from "@prisma/client";
import type { Debt } from "@/types/debt";
import type { InvestmentPosition } from "@/types/investment";
import type { RecurringRule } from "@/types/recurring";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type DebtDelegate = {
  findMany(args?: object): Promise<Debt[]>;
  findFirst(args: object): Promise<Debt | null>;
  create(args: { data: object }): Promise<Debt>;
  update(args: { where: object; data: object }): Promise<Debt>;
  delete(args: { where: object }): Promise<Debt>;
};

export const debt: DebtDelegate = (prisma as unknown as { debt: DebtDelegate })
  .debt;

type InvestmentPositionDelegate = {
  findMany(args?: object): Promise<InvestmentPosition[]>;
  findFirst(args: object): Promise<InvestmentPosition | null>;
  create(args: { data: object }): Promise<InvestmentPosition>;
  update(args: { where: object; data: object }): Promise<InvestmentPosition>;
  delete(args: { where: object }): Promise<InvestmentPosition>;
};

export const investmentPosition: InvestmentPositionDelegate = (
  prisma as unknown as { investmentPosition: InvestmentPositionDelegate }
).investmentPosition;

type RecurringRuleDelegate = {
  findMany(args?: object): Promise<RecurringRule[]>;
  findFirst(args: object): Promise<RecurringRule | null>;
  create(args: { data: object }): Promise<RecurringRule>;
  update(args: { where: object; data: object }): Promise<RecurringRule>;
  delete(args: { where: object }): Promise<RecurringRule>;
};

export const recurringRule: RecurringRuleDelegate = (
  prisma as unknown as { recurringRule: RecurringRuleDelegate }
).recurringRule;

type CategoryBudgetDelegate = {
  findMany(args?: object): Promise<CategoryBudgetRow[]>;
  findFirst(args: object): Promise<CategoryBudgetRow | null>;
  findUnique(args: object): Promise<CategoryBudgetRow | null>;
  create(args: { data: object }): Promise<CategoryBudgetRow>;
  update(args: { where: object; data: object }): Promise<CategoryBudgetRow>;
  delete(args: { where: object }): Promise<CategoryBudgetRow>;
};

export const categoryBudget: CategoryBudgetDelegate = (
  prisma as unknown as { categoryBudget: CategoryBudgetDelegate }
).categoryBudget;

type NotificationDelegate = {
  findMany(args?: object): Promise<NotificationRow[]>;
  findFirst(args: object): Promise<NotificationRow | null>;
  create(args: { data: object }): Promise<NotificationRow>;
  update(args: { where: object; data: object }): Promise<NotificationRow>;
  updateMany(args: { where: object; data: object }): Promise<{ count: number }>;
  delete(args: { where: object }): Promise<NotificationRow>;
  count(args?: object): Promise<number>;
};

export const notification: NotificationDelegate = (
  prisma as unknown as { notification: NotificationDelegate }
).notification;

type BudgetAlertLogDelegate = {
  findMany(args?: object): Promise<BudgetAlertLogRow[]>;
  create(args: { data: object }): Promise<BudgetAlertLogRow>;
};

export const budgetAlertLog: BudgetAlertLogDelegate = (
  prisma as unknown as { budgetAlertLog: BudgetAlertLogDelegate }
).budgetAlertLog;

type CategoryBudgetRow = {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: number;
  alertThresholdPercent: number;
  emailAlertsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type NotificationRow = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  readAt: Date | null;
  metadata: unknown;
  createdAt: Date;
};

type BudgetAlertLogRow = {
  id: string;
  budgetId: string;
  monthKey: string;
  alertType: string;
  createdAt: Date;
};
