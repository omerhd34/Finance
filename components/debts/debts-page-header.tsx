"use client";

import { NewDebtDialog } from "./new-debt-dialog";
import type { NewDebtFormValues } from "@/lib/debts-schema";

type Props = {
  newOpen: boolean;
  onNewOpenChange: (open: boolean) => void;
  currency: string;
  onCreate: (values: NewDebtFormValues) => Promise<void>;
};

export function DebtsPageHeader({
  newOpen,
  onNewOpenChange,
  currency,
  onCreate,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold">Borç &amp; Alacak</h2>
        <p className="text-sm text-muted-foreground">
          Sana borçlu olanları ve senin borçlarını tek yerden takip et.
        </p>
      </div>
      <NewDebtDialog
        open={newOpen}
        onOpenChange={onNewOpenChange}
        currency={currency}
        onSubmit={onCreate}
      />
    </div>
  );
}
