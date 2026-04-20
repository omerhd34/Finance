"use client";

import { currencySymbolLabel, formatMoneyAmount } from "@/lib/utils";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  totalReceivable: number;
  totalPayable: number;
  currency: string;
};

export function DebtsSummaryCards({
  totalReceivable,
  totalPayable,
  currency,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="gap-3 p-6 space-y-0">
          <CardDescription>
            Kalan toplam alacak ({currencySymbolLabel(currency)})
          </CardDescription>
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight text-emerald-500 tabular-nums">
            {formatMoneyAmount(totalReceivable, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="gap-3 p-6 space-y-0">
          <CardDescription>
            Kalan toplam borç ({currencySymbolLabel(currency)})
          </CardDescription>
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight text-amber-500 tabular-nums">
            {formatMoneyAmount(totalPayable, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
