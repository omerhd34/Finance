"use client";

import { NewPositionDialog } from "./new-position-dialog";
import type { PositionFormValues } from "@/lib/investments-schema";

type Props = {
  newOpen: boolean;
  onNewOpenChange: (open: boolean) => void;
  listTab: "GOLD" | "STOCK";
  currency: string;
  onCreate: (values: PositionFormValues) => Promise<void>;
};

export function InvestmentsPageHeader({
  newOpen,
  onNewOpenChange,
  listTab,
  currency,
  onCreate,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="max-w-5xl text-pretty text-sm text-muted-foreground">
          Hisse senetleri ve altın kayıtlarınızı takip edin. Güncel fiyat
          alanına bugünkü kuru girebilirsiniz. Güncel fiyat girilmeyen
          satırlarda alış fiyatı kullanılır.
        </p>
      </div>
      <NewPositionDialog
        open={newOpen}
        onOpenChange={onNewOpenChange}
        listTab={listTab}
        currency={currency}
        onSubmit={onCreate}
      />
    </div>
  );
}
