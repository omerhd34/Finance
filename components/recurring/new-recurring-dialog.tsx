"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import {
  normalizeUserCurrency,
  type UserDisplayCurrency,
} from "@/lib/common/currency";
import { parseApiErrorForUser } from "@/lib/email/email-verification-client";
import { defaultRecurringFormValues } from "@/lib/recurring/recurring-defaults";
import {
  recurringRuleFormSchema,
  type RecurringFormValues,
} from "@/lib/recurring/recurring-schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/store/hooks";
import { RecurringFormFields } from "./recurring-form-fields";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    values: RecurringFormValues,
    amountEntryCurrency: UserDisplayCurrency,
  ) => Promise<void>;
};

export function NewRecurringDialog({
  open,
  onOpenChange,
  onSubmit,
}: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const displayCurrency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [entryCurrency, setEntryCurrency] = useState<UserDisplayCurrency>(() =>
    normalizeUserCurrency(displayCurrency),
  );

  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringRuleFormSchema),
    defaultValues: defaultRecurringFormValues(),
  });

  useEffect(() => {
    if (open) {
      setEntryCurrency(normalizeUserCurrency(displayCurrency));
    }
  }, [open, displayCurrency]);

  async function handleSubmit(values: RecurringFormValues) {
    setSubmitError(null);
    try {
      await onSubmit(values, entryCurrency);
      form.reset(defaultRecurringFormValues());
      setEntryCurrency(normalizeUserCurrency(displayCurrency));
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
        <Button className="cursor-pointer bg-[#22c55e] text-primary-foreground hover:bg-[#22c55e]/90">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Tekrarlayan İşlem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tekrarlayan işlem</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((v) => void handleSubmit(v))}
        >
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
          <RecurringFormFields
            form={form}
            variant="new"
            amountEntryCurrency={entryCurrency}
            onAmountEntryCurrencyChange={setEntryCurrency}
          />
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
