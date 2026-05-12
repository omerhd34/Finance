import type { z } from "zod";
import {
  DEBT_EXPENSE_CATEGORY,
  RECEIVABLE_INCOME_CATEGORY,
} from "@/lib/domain/categories";

export function isDebtExpenseCategory(category: string): boolean {
  return category === DEBT_EXPENSE_CATEGORY;
}

export function isReceivableIncomeCategory(category: string): boolean {
  return category === RECEIVABLE_INCOME_CATEGORY;
}

export function refineManualTransactionCategoryBlocked<
  T extends {
    type: "income" | "expense";
    category: string;
  },
>(data: T, ctx: z.RefinementCtx, pathKey: "category") {
  if (isDebtExpenseCategory(data.category)) {
    ctx.addIssue({
      code: "custom",
      message: "Borç kayıtları Borç ve Alacak sayfasından yönetilir.",
      path: [pathKey],
    });
  }
  if (data.type === "income" && isReceivableIncomeCategory(data.category)) {
    ctx.addIssue({
      code: "custom",
      message: "Alacak kayıtları Borç ve Alacak sayfasından yönetilir.",
      path: [pathKey],
    });
  }
}
