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
        <h2 className="text-lg font-semibold">Hisse &amp; altın</h2>
        <p className="text-sm text-muted-foreground">
          BIST hisseleri ve gram altın pozisyonlarınızı takip edin. Güncel fiyat
          alanına bugünkü kuru girebilirsiniz (otomatik kotasyon yakında).
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
