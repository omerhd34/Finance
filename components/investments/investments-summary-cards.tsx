"use client";

import {
  currencySymbolLabel,
  formatMoney,
  formatMoneyAmount,
} from "@/lib/utils";
import {
  Card,
  CardContent,
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
        <CardHeader className="pb-2">
          <CardDescription>Toplam maliyet</CardDescription>
          <CardTitle className="text-xl tabular-nums">
            {formatMoney(totalCost, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Güncel değer (tahmini)</CardDescription>
          <CardTitle className="text-xl tabular-nums">
            {formatMoney(totalValue, currency)}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-muted-foreground">
          Güncel fiyat girilmeyen satırlarda alış fiyatı kullanılır.
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Kar / zarar</CardDescription>
          <CardTitle
            className={`text-xl tabular-nums ${
              pnl > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : pnl < 0
                  ? "text-destructive"
                  : ""
            }`}
          >
            {pnl >= 0 ? "+" : ""}
            {formatMoneyAmount(pnl, currency)} {currencySymbolLabel(currency)}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
