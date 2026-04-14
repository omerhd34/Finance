"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tryAmountToDisplay } from "@/lib/currency";
import { updateGoalAmountSchema } from "@/lib/goals-schema";
import { currencySymbolLabel } from "@/lib/utils";
import type { Goal } from "@/types/goal";
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

type FormValues = { currentAmount: number };

type Props = {
  goal: Goal | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onSave: (goalId: string, currentAmountDisplay: number) => Promise<void>;
};

export function UpdateGoalAmountDialog({
  goal,
  open,
  onOpenChange,
  currency,
  onSave,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(updateGoalAmountSchema),
    defaultValues: { currentAmount: 0 },
  });

  useEffect(() => {
    if (!goal) return;
    form.reset({
      currentAmount: tryAmountToDisplay(goal.currentAmount, currency),
    });
  }, [goal, form, currency]);

  async function handleSubmit(values: FormValues) {
    if (!goal) return;
    await onSave(goal.id, values.currentAmount);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mevcut tutarı güncelle</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Mevcut tutar ({currencySymbolLabel(currency)})</Label>
            <Input
              type="number"
              step="0.01"
              {...form.register("currentAmount", { valueAsNumber: true })}
            />
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
