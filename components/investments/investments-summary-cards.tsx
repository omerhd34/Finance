"use client";

import { currencySymbolLabel, formatMoneyAmount } from "@/lib/utils";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  totalCost: number;
  totalValue: number;
  pnl: number;
  currency: string;
};

export function InvestmentsSummaryCards({
  totalCost,
  totalValue,
  pnl,
  currency,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="gap-3 p-6 space-y-0">
          <CardDescription>
            Toplam maliyet ({currencySymbolLabel(currency)})
          </CardDescription>
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight text-amber-600 tabular-nums dark:text-amber-400">
            {formatMoneyAmount(totalCost, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="gap-3 p-6 space-y-0">
          <CardDescription>
            Güncel değer ({currencySymbolLabel(currency)})
          </CardDescription>
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight text-sky-600 tabular-nums dark:text-sky-400">
            {formatMoneyAmount(totalValue, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="gap-3 p-6 space-y-0">
          <CardDescription>
            Kar / zarar ({currencySymbolLabel(currency)})
          </CardDescription>
          <CardTitle
            className={`text-2xl font-semibold leading-none tracking-tight tabular-nums ${
              pnl > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : pnl < 0
                  ? "text-destructive"
                  : ""
            }`}
          >
            {pnl >= 0 ? "+" : ""}
            {formatMoneyAmount(pnl, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
