/* eslint-disable react-hooks/incompatible-library */
"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { parseApiErrorForUser } from "@/lib/email-verification-client";
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
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    setSubmitError(null);
    try {
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
        <Button>
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Toplam tutar ({currencySymbolLabel(currency)})</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("totalAmount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Şu ana kadar ödenen ({currencySymbolLabel(currency)})
              </Label>
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
