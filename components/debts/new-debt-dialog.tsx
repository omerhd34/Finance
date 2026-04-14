/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { newDebtSchema, type NewDebtFormValues } from "@/lib/debts-schema";
import { currencySymbolLabel } from "@/lib/utils";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onSubmit: (values: NewDebtFormValues) => Promise<void>;
};

export function NewDebtDialog({
  open,
  onOpenChange,
  currency,
  onSubmit,
}: Props) {
  const form = useForm<NewDebtFormValues>({
    resolver: zodResolver(newDebtSchema),
    defaultValues: {
      direction: "RECEIVABLE",
      counterparty: "",
      totalAmount: 0,
      paidAmount: 0,
      dueDate: "",
      note: "",
    },
  });

  async function handleSubmit(values: NewDebtFormValues) {
    await onSubmit(values);
    form.reset({
      direction: "RECEIVABLE",
      counterparty: "",
      totalAmount: 0,
      paidAmount: 0,
      dueDate: "",
      note: "",
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Yeni kayıt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni borç / alacak</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Tutarlar {currencySymbolLabel(currency)} cinsinden; kayıt TL olarak
            saklanır.
          </p>
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
                <SelectItem value="RECEIVABLE" className="cursor-pointer">
                  Bana borçlu (alacak)
                </SelectItem>
                <SelectItem value="PAYABLE" className="cursor-pointer">
                  Benim borcum
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kişi / başlık</Label>
            <Input {...form.register("counterparty")} />
            {form.formState.errors.counterparty && (
              <p className="text-sm text-destructive">
                {form.formState.errors.counterparty.message}
              </p>
            )}
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
            <Label>Şu ana kadar ödenen ({currencySymbolLabel(currency)})</Label>
            <Input
              type="number"
              step="0.01"
              {...form.register("paidAmount", { valueAsNumber: true })}
            />
            {form.formState.errors.paidAmount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.paidAmount.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Vade (isteğe bağlı)</Label>
            <DatePickerField
              className="cursor-pointer"
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
            <Button type="submit" className="cursor-pointer">
              Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
