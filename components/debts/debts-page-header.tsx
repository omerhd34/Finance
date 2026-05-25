"use client";

import { NewDebtDialog, type SymbolOptionsByGroup } from "./new-debt-dialog";
import type { NewDebtFormValues } from "@/lib/debts/debts-schema";

type Props = {
  newOpen: boolean;
  onNewOpenChange: (open: boolean) => void;
  onCreate: (values: NewDebtFormValues) => Promise<void>;
  symbolOptionsByGroup: SymbolOptionsByGroup;
};

export function DebtsPageHeader({
  newOpen,
  onNewOpenChange,
  onCreate,
  symbolOptionsByGroup,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Sana borçlu olanları ve senin borçlarını tek yerden takip et.
        </p>
      </div>
      <NewDebtDialog
        open={newOpen}
        onOpenChange={onNewOpenChange}
        onSubmit={onCreate}
        symbolOptionsByGroup={symbolOptionsByGroup}
      />
    </div>
  );
}
