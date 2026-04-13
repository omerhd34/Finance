"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import {
  newGoalSchema,
  type NewGoalFormValues,
} from "@/lib/goals-schema";
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
  const form = useForm<NewGoalFormValues>({
    resolver: zodResolver(newGoalSchema),
    defaultValues: {
      title: "",
      targetAmount: 0,
      deadline: "",
    },
  });

  async function handleSubmit(values: NewGoalFormValues) {
    await onSubmit(values);
    form.reset({
      title: "",
      targetAmount: 0,
      deadline: "",
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Yeni Hedef
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni hedef</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
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
              value={form.watch("deadline") ?? ""}
              onChange={(v) => form.setValue("deadline", v)}
              allowClear
              placeholder="Tarih seçin"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Oluştur</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
