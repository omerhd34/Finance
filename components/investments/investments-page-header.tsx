"use client";

import { NewPositionDialog } from "./new-position-dialog";
import type { PositionFormValues } from "@/lib/investments/investments-schema";
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
          Altın, gümüş, platin, döviz, hisse ve kripto pozisyonlarınızı tek
          ekrandan takip edin. Güncel birim fiyatlar mümkün olduğunda otomatik
          gelir; canlı veri yoksa önce kayıtlı piyasa fiyatınız, o da yoksa alış
          fiyatınız kullanılır. Kripto kotasyonları USD üzerinden USD/TRY ile TL
          hesaplanır.
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
