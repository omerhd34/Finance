/* eslint-disable react-hooks/incompatible-library */
"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { parseApiErrorForUser } from "@/lib/email-verification-client";
import { newGoalSchema, type NewGoalFormValues } from "@/lib/goals-schema";
import { currencySymbolLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onSubmit: (values: NewGoalFormValues) => Promise<void>;
};

export function NewGoalDialog({
  open,
  onOpenChange,
  currency,
  onSubmit,
}: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<NewGoalFormValues>({
    resolver: zodResolver(newGoalSchema),
    defaultValues: {
      title: "",
      targetAmount: 0,
      deadline: "",
    },
  });

  async function handleSubmit(values: NewGoalFormValues) {
    setSubmitError(null);
    try {
      await onSubmit(values);
      form.reset({
        title: "",
        targetAmount: 0,
        deadline: "",
      });
      onOpenChange(false);
    } catch (e: unknown) {
      setSubmitError(
        parseApiErrorForUser(e, "Hedef oluşturulamadı. Tekrar deneyin."),
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
          Yeni Hedef
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni hedef</DialogTitle>
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
            Tutarlar {currencySymbolLabel(currency)} cinsinden girilir; kayıt TL
            olarak saklanır.
          </p>
          <div className="space-y-2">
            <Label>Başlık</Label>
            <Input {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Hedef tutar ({currencySymbolLabel(currency)})</Label>
            <Input
              type="number"
              step="0.01"
              {...form.register("targetAmount", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>Bitiş tarihi (isteğe bağlı)</Label>
            <DatePickerField
              className="cursor-pointer"
              value={form.watch("deadline") ?? ""}
              onChange={(v) => form.setValue("deadline", v)}
              allowClear
              placeholder="Tarih seçin"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="cursor-pointer"
            >
              {form.formState.isSubmitting ? "Kaydediliyor…" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
