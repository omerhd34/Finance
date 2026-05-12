"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { payDebtSchema } from "@/lib/debts/debts-schema";
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

type PrincipalForm = { amount: number };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amountDisplay: number) => Promise<void>;
};

export function AddDebtPrincipalDialog({
  open,
  onOpenChange,
  onSubmit,
}: Props) {
  const form = useForm<PrincipalForm>({
    resolver: zodResolver(payDebtSchema),
    defaultValues: { amount: 0 },
  });

  useEffect(() => {
    if (open) form.reset({ amount: 0 });
  }, [open, form]);

  async function handleSubmit(values: PrincipalForm) {
    await onSubmit(values.amount);
    form.reset({ amount: 0 });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni borç ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Girdiğiniz tutar toplam borca eklenir.
          </p>
          <div className="space-y-2">
            <Label>Tutar</Label>
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
            <Button type="submit" className="cursor-pointer">
              Uygula
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
