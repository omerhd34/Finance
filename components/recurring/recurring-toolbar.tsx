"use client";

import type { RecurringFormValues } from "@/lib/recurring/recurring-schema";
import { NewRecurringDialog } from "./new-recurring-dialog";

type Props = {
  count: number;
  totalCount?: number;
  newOpen: boolean;
  onNewOpenChange: (open: boolean) => void;
  onCreate: (
    values: RecurringFormValues,
    amountEntryCurrency: string,
  ) => Promise<void>;
};

export function RecurringToolbar({
  count,
  totalCount,
  newOpen,
  onNewOpenChange,
  onCreate,
}: Props) {
  const showFiltered =
    typeof totalCount === "number" && totalCount !== count;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {showFiltered
          ? `${count} / ${totalCount} tekrarlayan işlem`
          : `${count} tekrarlayan işlem`}
      </p>
      <NewRecurringDialog
        open={newOpen}
        onOpenChange={onNewOpenChange}
        onSubmit={onCreate}
      />
    </div>
  );
}
