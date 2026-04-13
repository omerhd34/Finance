"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tryAmountToDisplay } from "@/lib/currency";
import { defaultRecurringFormValues } from "@/lib/recurring-defaults";
import {
  recurringRuleFormSchema,
  type RecurringFormValues,
} from "@/lib/recurring-schema";
import type { RecurringRule } from "@/types/recurring";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecurringFormFields } from "./recurring-form-fields";

type Props = {
  rule: RecurringRule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onSave: (ruleId: string, values: RecurringFormValues) => Promise<void>;
};

export function EditRecurringDialog({
  rule,
  open,
  onOpenChange,
  currency,
  onSave,
}: Props) {
  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringRuleFormSchema),
    defaultValues: defaultRecurringFormValues(),
  });

  useEffect(() => {
    if (!rule) return;
    form.reset({
      type: rule.type as "income" | "expense",
      amount: tryAmountToDisplay(rule.amount, currency),
      category: rule.category,
      description: rule.description ?? "",
      frequency: rule.frequency as RecurringFormValues["frequency"],
      interval: rule.interval,
      startDate: new Date(rule.startDate).toISOString().slice(0, 10),
      endDate: rule.endDate
        ? new Date(rule.endDate).toISOString().slice(0, 10)
        : "",
      mode: rule.mode as RecurringFormValues["mode"],
      isActive: rule.isActive,
    });
  }, [rule, form, currency]);

  async function handleSubmit(values: RecurringFormValues) {
    if (!rule) return;
    await onSave(rule.id, values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tekrarlayan işlemi düzenle</DialogTitle>
        </DialogHeader>
        {rule && (
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((v) => void handleSubmit(v))}
          >
            <RecurringFormFields
              form={form}
              currency={currency}
              variant="edit"
            />
            <DialogFooter>
              <Button type="submit">Kaydet</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
