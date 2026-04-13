/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tryAmountToDisplay } from "@/lib/currency";
import { editDebtSchema, type NewDebtFormValues } from "@/lib/debts-schema";
import { currencySymbolLabel } from "@/lib/utils";
import type { Debt } from "@/types/debt";
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

type Props = {
  debt: Debt | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onSave: (values: NewDebtFormValues) => Promise<void>;
};

export function EditDebtDialog({
  debt,
  open,
  onOpenChange,
  currency,
  onSave,
}: Props) {
  const form = useForm<NewDebtFormValues>({
    resolver: zodResolver(editDebtSchema),
    defaultValues: {
      direction: "RECEIVABLE",
      counterparty: "",
      totalAmount: 0,
      paidAmount: 0,
      dueDate: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!debt) return;
    form.reset({
      direction: debt.direction,
      counterparty: debt.counterparty,
      totalAmount: tryAmountToDisplay(debt.totalAmount, currency),
      paidAmount: tryAmountToDisplay(debt.paidAmount, currency),
      dueDate: debt.dueDate
        ? new Date(debt.dueDate).toISOString().slice(0, 10)
        : "",
      note: debt.note ?? "",
    });
  }, [debt, form, currency]);

  async function handleSubmit(values: NewDebtFormValues) {
    await onSave(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kaydı düzenle</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Tür</Label>
            <Select
              value={form.watch("direction")}
              onValueChange={(v: "RECEIVABLE" | "PAYABLE") =>
                form.setValue("direction", v)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RECEIVABLE">Bana borçlu (alacak)</SelectItem>
                <SelectItem value="PAYABLE">Benim borcum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kişi / başlık</Label>
            <Input {...form.register("counterparty")} />
          </div>
          <div className="space-y-2">
            <Label>Toplam tutar ({currencySymbolLabel(currency)})</Label>
            <Input
              type="number"
              step="0.01"
              {...form.register("totalAmount", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>Ödenen ({currencySymbolLabel(currency)})</Label>
            <Input
              type="number"
              step="0.01"
              {...form.register("paidAmount", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>Vade</Label>
            <DatePickerField
              value={form.watch("dueDate") ?? ""}
              onChange={(v) => form.setValue("dueDate", v)}
              allowClear
              placeholder="Tarih seçin"
            />
          </div>
          <div className="space-y-2">
            <Label>Not</Label>
            <Textarea rows={3} {...form.register("note")} />
          </div>
          <DialogFooter>
            <Button type="submit">Kaydet</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
