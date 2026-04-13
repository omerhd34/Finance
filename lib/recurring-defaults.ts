import { EXPENSE_CATEGORIES } from "@/lib/categories";
import type { RecurringFormValues } from "@/lib/recurring-schema";

export function defaultRecurringFormValues(): RecurringFormValues {
  return {
    type: "expense",
    amount: 0,
    category: EXPENSE_CATEGORIES[0],
    description: "",
    frequency: "MONTHLY",
    interval: 1,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    mode: "AUTO",
    isActive: true,
  };
}
