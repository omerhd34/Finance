"use client";

import { NewPositionDialog } from "./new-position-dialog";
import type { PositionFormValues } from "@/lib/investments-schema";
import type { InvestmentAssetType } from "@/types/investment";

type Props = {
  newOpen: boolean;
  onNewOpenChange: (open: boolean) => void;
  listTab: InvestmentAssetType;
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
          Altın, hisse, döviz ve kripto kayıtlarınızı takip edin. Güncel birim
          fiyat CollectAPI ile otomatik gelir ve değiştirilemez. Kripto
          fiyatları USD üzerinden USD/TRY ile TL hesaplanır. Canlı veri yoksa
          tabloda alış fiyatı kullanılır.
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
