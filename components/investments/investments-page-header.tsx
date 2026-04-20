"use client";

import { NewPositionDialog } from "./new-position-dialog";
import type { PositionFormValues } from "@/lib/investments-schema";

type Props = {
  newOpen: boolean;
  onNewOpenChange: (open: boolean) => void;
  listTab: "GOLD" | "STOCK";
  currency: string;
  onCreate: (values: PositionFormValues) => Promise<void>;
  addDisabled?: boolean;
};

export function InvestmentsPageHeader({
  newOpen,
  onNewOpenChange,
  listTab,
  currency,
  onCreate,
  addDisabled = false,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Hisse senetleri ve altın pozisyonlarınızı takip edin. Güncel fiyat
          alanına bugünkü kuru girebilirsiniz.
        </p>
      </div>
      <NewPositionDialog
        open={newOpen}
        onOpenChange={onNewOpenChange}
        listTab={listTab}
        currency={currency}
        onSubmit={onCreate}
        disabled={addDisabled}
      />
    </div>
  );
}
