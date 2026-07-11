/* eslint-disable react-hooks/incompatible-library */
"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { parseApiErrorForUser } from "@/lib/email/email-verification-client";
import {
  newDebtSchema,
  type NewDebtFormValues,
} from "@/lib/debts/debts-schema";
import {
  DEFAULT_DEBT_ASSET_UNIT,
  debtAssetUnitLabel,
} from "@/lib/debts/debt-asset-units";
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
import {
  DebtAssetUnitPicker,
  type SymbolOptionsByGroup,
} from "./debt-asset-unit-picker";

export type {
  SymbolOption,
  SymbolOptionsByGroup,
} from "./debt-asset-unit-picker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: NewDebtFormValues) => Promise<void>;
  symbolOptionsByGroup: SymbolOptionsByGroup;
};

const DEFAULT_VALUES: NewDebtFormValues = {
  direction: "RECEIVABLE",
  counterparty: "",
  totalAmount: 0,
  paidAmount: 0,
  assetUnit: DEFAULT_DEBT_ASSET_UNIT,
  assetSymbol: "",
  dueDate: "",
  note: "",
  syncTransactions: false,
};

export function NewDebtDialog({
  open,
  onOpenChange,
  onSubmit,
  symbolOptionsByGroup,
}: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<NewDebtFormValues>({
    resolver: zodResolver(newDebtSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const assetUnit = form.watch("assetUnit") ?? DEFAULT_DEBT_ASSET_UNIT;
  const assetSymbol = form.watch("assetSymbol") ?? "";
  const unitShort =
    assetUnit === "FX" && assetSymbol
      ? assetSymbol
      : debtAssetUnitLabel(assetUnit, "short");

  async function handleSubmit(values: NewDebtFormValues) {
    setSubmitError(null);
    try {
      await onSubmit(values);
      form.reset(DEFAULT_VALUES);
      onOpenChange(false);
    } catch (e: unknown) {
      setSubmitError(
        parseApiErrorForUser(e, "Kayıt oluşturulamadı. Tekrar deneyin."),
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setSubmitError(null);
        onOpenChange(o);
      }}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="h-4 w-4" />
          Yeni kayıt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni borç / alacak</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {submitError ? (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-foreground">
              <p>{submitError}</p>
              <p className="mt-2">
                <Link
                  href="/profil"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  Profil sayfasına git
                </Link>
              </p>
            </div>
          ) : null}
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
            {form.formState.errors.counterparty && (
              <p className="text-sm text-destructive">
                {form.formState.errors.counterparty.message}
              </p>
            )}
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
              <Label>Şu ana kadar ödenen ({unitShort})</Label>
              <Input
                type="number"
                step="0.0001"
                {...form.register("paidAmount", { valueAsNumber: true })}
              />
              {form.formState.errors.paidAmount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.paidAmount.message}
                </p>
              )}
            </div>
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
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
              checked={form.watch("syncTransactions")}
              onChange={(e) =>
                form.setValue("syncTransactions", e.target.checked)
              }
            />
            <span className="space-y-1 text-sm">
              <span className="block font-medium text-foreground">
                Nakit akışına yansıt
              </span>
              <span className="block text-muted-foreground">
                İşaretlenirse işlem listesine kayıt eklenir. Mevcut borç ve
                alacaklar için işaretlemeyin; yalnızca bugün para verdiğiniz
                veya aldığınız kayıtlar için kullanın.
              </span>
            </span>
          </label>
          <DialogFooter>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="cursor-pointer"
            >
              {form.formState.isSubmitting ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
