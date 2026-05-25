/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tryAmountToDisplay } from "@/lib/common/currency";
import {
  editDebtSchema,
  type NewDebtFormValues,
} from "@/lib/debts/debts-schema";
import {
  DEFAULT_DEBT_ASSET_UNIT,
  debtAssetUnitLabel,
  isTryAssetUnit,
  normalizeDebtAssetUnit,
} from "@/lib/debts/debt-asset-units";
import type { Debt } from "@/types/debt";
import {
  DebtAssetUnitPicker,
  type SymbolOptionsByGroup,
} from "./debt-asset-unit-picker";
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
  symbolOptionsByGroup: SymbolOptionsByGroup;
};

export function EditDebtDialog({
  debt,
  open,
  onOpenChange,
  currency,
  onSave,
  symbolOptionsByGroup,
}: Props) {
  const form = useForm<NewDebtFormValues>({
    resolver: zodResolver(editDebtSchema),
    defaultValues: {
      direction: "RECEIVABLE",
      counterparty: "",
      totalAmount: 0,
      paidAmount: 0,
      assetUnit: DEFAULT_DEBT_ASSET_UNIT,
      assetSymbol: "",
      dueDate: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!debt) return;
    const unit = normalizeDebtAssetUnit(debt.assetUnit);
    const showAsTry = isTryAssetUnit(unit);
    form.reset({
      direction: debt.direction,
      counterparty: debt.counterparty,
      totalAmount: showAsTry
        ? tryAmountToDisplay(debt.totalAmount, currency)
        : debt.totalAmount,
      paidAmount: showAsTry
        ? tryAmountToDisplay(debt.paidAmount, currency)
        : debt.paidAmount,
      assetUnit: unit,
      assetSymbol: debt.assetSymbol ?? "",
      dueDate: debt.dueDate
        ? new Date(debt.dueDate).toISOString().slice(0, 10)
        : "",
      note: debt.note ?? "",
    });
  }, [debt, form, currency]);

  const assetUnit = form.watch("assetUnit") ?? DEFAULT_DEBT_ASSET_UNIT;
  const assetSymbol = form.watch("assetSymbol") ?? "";
  const unitShort =
    assetUnit === "FX" && assetSymbol
      ? assetSymbol
      : debtAssetUnitLabel(assetUnit, "short");

  async function handleSubmit(values: NewDebtFormValues) {
    await onSave(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
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
                <SelectItem value="RECEIVABLE" className="cursor-pointer">
                  Bana borçlu (alacak)
                </SelectItem>
                <SelectItem value="PAYABLE" className="cursor-pointer">
                  Benim borcum
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DebtAssetUnitPicker
            unit={assetUnit}
            symbol={assetSymbol}
            onChange={({ unit, symbol }) => {
              form.setValue(
                "assetUnit",
                unit as NewDebtFormValues["assetUnit"],
              );
              form.setValue("assetSymbol", symbol);
            }}
            symbolOptionsByGroup={symbolOptionsByGroup}
            errorMessage={
              form.formState.errors.assetSymbol?.message as string | undefined
            }
          />
          <div className="space-y-2">
            <Label>Kişi / başlık</Label>
            <Input {...form.register("counterparty")} />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Toplam ({unitShort})</Label>
              <Input
                type="number"
                step="0.0001"
                {...form.register("totalAmount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ödenen ({unitShort})</Label>
              <Input
                type="number"
                step="0.0001"
                {...form.register("paidAmount", { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Vade</Label>
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
