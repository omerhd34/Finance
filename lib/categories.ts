export const EXPENSE_CATEGORIES = [
  "Yiyecek",
  "Market",
  "Ulaşım",
  "Kira",
  "Faturalar",
  "Sağlık",
  "Eğlence",
  "Alışveriş",
  "Eğitim",
  "Diğer",
] as const;

export const INCOME_CATEGORIES = [
  "Maaş",
  "Freelance",
  "Yatırım",
  "Kira Geliri",
  "Diğer",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
