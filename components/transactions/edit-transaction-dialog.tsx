/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tryAmountToDisplay } from "@/lib/currency";
import {
  transactionEditFormSchema,
  type TransactionEditFormValues,
} from "@/lib/validations";
import { currencySymbolLabel } from "@/lib/utils";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import type { Transaction } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onSave: (
    transactionId: string,
    values: TransactionEditFormValues,
  ) => Promise<void>;
};

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  currency,
  onSave,
}: Props) {
  const isRecurringTransaction =
    Boolean(transaction?.recurringRuleId) ||
    Boolean(transaction?.recurringSlotKey) ||
    transaction?.description?.startsWith("[Tekrarlayan]") === true;

  const form = useForm<TransactionEditFormValues>({
    resolver: zodResolver(transactionEditFormSchema),
  });

  useEffect(() => {
    if (!transaction) return;
    form.reset({
      type: transaction.type === "income" ? "income" : "expense",
      amount: tryAmountToDisplay(transaction.amount, currency),
      category: transaction.category,
      description: transaction.description ?? "",
      date: new Date(transaction.date).toISOString().slice(0, 10),
    });
  }, [transaction, form, currency]);

  const selectedType = form.watch("type");
  const categories = useMemo(() => {
    const typ = selectedType ?? transaction?.type ?? "expense";
    return typ === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  }, [selectedType, transaction?.type]);

  async function handleSubmit(values: TransactionEditFormValues) {
    if (!transaction) return;
    if (isRecurringTransaction) return;
    await onSave(transaction.id, values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>İşlemi düzenle</DialogTitle>
        </DialogHeader>
        {transaction && (
          <form
            onSubmit={form.handleSubmit((v) => void handleSubmit(v))}
            className="space-y-4"
          >
            <Tabs
              value={selectedType}
              onValueChange={(value) => {
                if (isRecurringTransaction) return;
                if (value !== "income" && value !== "expense") return;
                form.setValue("type", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                });

                const nextCategories: readonly string[] =
                  value === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
                const currentCategory = form.getValues("category");
                if (!nextCategories.includes(currentCategory)) {
                  form.setValue("category", nextCategories[0], {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="expense"
                  disabled={isRecurringTransaction}
                  className="cursor-pointer"
                >
                  Gider
                </TabsTrigger>
                <TabsTrigger
                  value="income"
                  disabled={isRecurringTransaction}
                  className="cursor-pointer"
                >
                  Gelir
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="space-y-2">
              <Label>Tutar ({currencySymbolLabel(currency)})</Label>
              <Input
                type="number"
                step="0.01"
                disabled={isRecurringTransaction}
                {...form.register("amount", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Kayıt TL olarak saklanır.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={form.watch("category")}
                disabled={isRecurringTransaction}
                onValueChange={(v) => form.setValue("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                {...form.register("description")}
                rows={2}
                disabled={isRecurringTransaction}
              />
            </div>
            <div className="space-y-2">
              <Label>Tarih</Label>
              <DatePickerField
                className={
                  isRecurringTransaction ? undefined : "cursor-pointer"
                }
                disabled={isRecurringTransaction}
                value={form.watch("date")}
                onChange={(v) =>
                  form.setValue("date", v, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isRecurringTransaction}
              >
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
