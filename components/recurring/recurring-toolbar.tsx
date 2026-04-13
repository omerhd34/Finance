"use client";

import type { RecurringFormValues } from "@/lib/recurring-schema";
import { NewRecurringDialog } from "./new-recurring-dialog";

type Props = {
  count: number;
  newOpen: boolean;
  onNewOpenChange: (open: boolean) => void;
  currency: string;
  onCreate: (values: RecurringFormValues) => Promise<void>;
};

export function RecurringToolbar({
  count,
  newOpen,
  onNewOpenChange,
  currency,
  onCreate,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{count} tekrarlayan işlem</p>
      <NewRecurringDialog
        open={newOpen}
        onOpenChange={onNewOpenChange}
        currency={currency}
        onSubmit={onCreate}
      />
    </div>
  );
}
