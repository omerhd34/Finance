import {
  displayAmountToTry,
  type UserDisplayCurrency,
} from "@/lib/common/currency";
import { formValueToExpenseSubcategory } from "@/lib/domain/categories";
import type { RecurringFormValues } from "@/lib/recurring/recurring-schema";

export function buildRecurringRulePayload(
  values: RecurringFormValues,
  amountEntryCurrency: UserDisplayCurrency,
) {
  return {
    type: values.type,
    amount: displayAmountToTry(values.amount, amountEntryCurrency),
    category: values.category,
    subcategory:
      values.type === "expense"
        ? (formValueToExpenseSubcategory(values.subcategory) ?? null)
        : null,
    description: values.description?.trim()
      ? values.description.trim()
      : null,
    frequency: values.frequency,
    interval: values.interval,
    startDate: new Date(values.startDate + "T12:00:00").toISOString(),
    endDate: values.endDate?.trim()
      ? new Date(values.endDate.trim() + "T12:00:00").toISOString()
      : null,
    mode: values.mode,
    isActive: values.isActive,
  };
}
