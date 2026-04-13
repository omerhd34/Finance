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
  const form = useForm<TransactionEditFormValues>({
    resolver: zodResolver(transactionEditFormSchema),
  });

  useEffect(() => {
    if (!transaction) return;
    form.reset({
      amount: tryAmountToDisplay(transaction.amount, currency),
      category: transaction.category,
      description: transaction.description ?? "",
      date: new Date(transaction.date).toISOString().slice(0, 10),
    });
  }, [transaction, form, currency]);

  const categories = useMemo(() => {
    const typ = transaction?.type ?? "expense";
    return typ === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  }, [transaction?.type]);

  async function handleSubmit(values: TransactionEditFormValues) {
    if (!transaction) return;
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
            <Tabs value={transaction.type}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense" disabled>
                  Gider
                </TabsTrigger>
                <TabsTrigger value="income" disabled>
                  Gelir
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              Tür:{" "}
              <strong>
                {transaction.type === "income" ? "Gelir" : "Gider"}
              </strong>{" "}
              (değiştirilemez)
            </p>
            <div className="space-y-2">
              <Label>Tutar ({currencySymbolLabel(currency)})</Label>
              <Input
                type="number"
                step="0.01"
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
              <Textarea {...form.register("description")} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Tarih</Label>
              <DatePickerField
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
              <Button type="submit" className="cursor-pointer">
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
