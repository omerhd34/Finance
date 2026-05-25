"use client";

import { differenceInCalendarDays } from "date-fns";
import { debtProgressPercent, debtRemaining } from "@/lib/debts/debt-remaining";
import { formatDateTR, formatMoneyAmount } from "@/lib/common/utils";
import {
  convertDebtAssetToTry,
  formatDebtAssetAmount,
  isTryAssetUnit,
  type DebtAssetTryRates,
} from "@/lib/debts/debt-asset-units";
import type { Debt } from "@/types/debt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Props = {
  debt: Debt;
  currency: string;
  tryRates: DebtAssetTryRates;
  onPay: () => void;
  onAddPrincipal: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function DebtCard({
  debt: d,
  currency,
  tryRates,
  onPay,
  onAddPrincipal,
  onEdit,
  onDelete,
}: Props) {
  const rem = debtRemaining(d);
  const settled = rem <= 0;
  const daysLeft = d.dueDate
    ? differenceInCalendarDays(new Date(d.dueDate), new Date())
    : null;
  const isTry = isTryAssetUnit(d.assetUnit);

  const remainingLabel = isTry
    ? formatMoneyAmount(rem, currency)
    : formatDebtAssetAmount(rem, d.assetUnit, d.assetSymbol);
  const totalLabel = isTry
    ? formatMoneyAmount(d.totalAmount, currency)
    : formatDebtAssetAmount(d.totalAmount, d.assetUnit, d.assetSymbol);
  const paidLabel = isTry
    ? formatMoneyAmount(d.paidAmount, currency)
    : formatDebtAssetAmount(d.paidAmount, d.assetUnit, d.assetSymbol);

  const remTry = !isTry
    ? convertDebtAssetToTry(rem, d.assetUnit, tryRates, d.assetSymbol)
    : null;
  const totalTry = !isTry
    ? convertDebtAssetToTry(d.totalAmount, d.assetUnit, tryRates, d.assetSymbol)
    : null;

  return (
    <Card className={settled ? "opacity-75" : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 pr-2">{d.counterparty}</CardTitle>
          <div className="flex items-center gap-1.5">
            {settled && (
              <Badge variant="secondary" className="shrink-0">
                Kapandı
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Kalan: {remainingLabel} - Toplam: {totalLabel}
        </CardDescription>
        {!isTry && remTry != null && totalTry != null ? (
          <p className="text-xs text-muted-foreground tabular-nums">
            ≈ Kalan {formatMoneyAmount(remTry, currency)} - Toplam{" "}
            {formatMoneyAmount(totalTry, currency)} (anlık fiyat)
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={debtProgressPercent(d)} />
        <p className="text-xs text-muted-foreground">
          Ödenen: {paidLabel}
          {d.dueDate
            ? ` - Vade: ${formatDateTR(d.dueDate)}${
                !settled && daysLeft !== null
                  ? ` - ${daysLeft >= 0 ? `${daysLeft} gün kaldı` : `${Math.abs(daysLeft)} gün geçti`}`
                  : ""
              }`
            : ""}
        </p>
        {d.note ? (
          <p className="text-xs text-muted-foreground line-clamp-3">{d.note}</p>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={settled}
          onClick={onPay}
          className="cursor-pointer"
        >
          Ödeme ekle
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onAddPrincipal}
          className="cursor-pointer"
        >
          Yeni borç ekle
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="cursor-pointer"
        >
          Düzenle
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive cursor-pointer"
          onClick={onDelete}
        >
          Sil
        </Button>
      </CardFooter>
    </Card>
  );
}
