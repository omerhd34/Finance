"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { defaultRecurringFormValues } from "@/lib/recurring-defaults";
import {
  recurringRuleFormSchema,
  type RecurringFormValues,
} from "@/lib/recurring-schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RecurringFormFields } from "./recurring-form-fields";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onSubmit: (values: RecurringFormValues) => Promise<void>;
};

export function NewRecurringDialog({
  open,
  onOpenChange,
  currency,
  onSubmit,
}: Props) {
  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringRuleFormSchema),
    defaultValues: defaultRecurringFormValues(),
  });

  async function handleSubmit(values: RecurringFormValues) {
    await onSubmit(values);
    form.reset(defaultRecurringFormValues());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-[#22c55e] text-primary-foreground hover:bg-[#22c55e]/90">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Tekrarlayan İşlem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tekrarlayan işlem</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((v) => void handleSubmit(v))}
        >
          <RecurringFormFields form={form} currency={currency} variant="new" />
          <DialogFooter>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="cursor-pointer"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
