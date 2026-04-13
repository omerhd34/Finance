import { endOfDay } from "date-fns";
import type { RecurringRule } from "@/types/recurring";

export function isRecurringReminderDue(rule: RecurringRule): boolean {
  if (!rule.isActive || rule.mode !== "REMINDER") return false;
  return new Date(rule.nextDueDate) <= endOfDay(new Date());
}
