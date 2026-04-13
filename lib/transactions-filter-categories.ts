import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";

export const ALL_TRANSACTION_FILTER_CATEGORIES = Array.from(
  new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]),
);
