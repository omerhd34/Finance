"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { payDebtSchema } from "@/lib/debts-schema";
import { currencySymbolLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PayForm = { amount: number };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onPay: (amountDisplay: number) => Promise<void>;
};

export function PayDebtDialog({ open, onOpenChange, currency, onPay }: Props) {
  const form = useForm<PayForm>({
    resolver: zodResolver(payDebtSchema),
    defaultValues: { amount: 0 },
  });

  useEffect(() => {
    if (open) form.reset({ amount: 0 });
  }, [open, form]);

  async function handleSubmit(values: PayForm) {
    await onPay(values.amount);
    form.reset({ amount: 0 });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ödeme ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Tutar {currencySymbolLabel(currency)} cinsinden; kalan tutarı
            aşmayacak şekilde uygulanır.
          </p>
          <div className="space-y-2">
            <Label>Tutar ({currencySymbolLabel(currency)})</Label>
            <Input
              type="number"
              step="0.01"
              {...form.register("amount", { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Uygula</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
