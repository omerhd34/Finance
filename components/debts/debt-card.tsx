"use client";

import { differenceInCalendarDays } from "date-fns";
import { debtProgressPercent, debtRemaining } from "@/lib/debt-remaining";
import {
  currencySymbolLabel,
  formatDateTR,
  formatMoneyAmount,
} from "@/lib/utils";
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
  onPay: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function DebtCard({
  debt: d,
  currency,
  onPay,
  onEdit,
  onDelete,
}: Props) {
  const rem = debtRemaining(d);
  const settled = rem <= 0;
  const currencySymbol = currencySymbolLabel(currency);
  const currencyChipClass =
    "inline-flex items-center rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground";
  const daysLeft = d.dueDate
    ? differenceInCalendarDays(new Date(d.dueDate), new Date())
    : null;

  return (
    <Card className={settled ? "opacity-75" : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 pr-2">{d.counterparty}</CardTitle>
          <div className="flex items-center gap-1.5">
            <span className={currencyChipClass}>{currencySymbol}</span>
            {settled && (
              <Badge variant="secondary" className="shrink-0">
                Kapandı
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Kalan: {formatMoneyAmount(rem, currency)} - Toplam:{" "}
          {formatMoneyAmount(d.totalAmount, currency)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={debtProgressPercent(d)} />
        <p className="text-xs text-muted-foreground">
          Ödenen: {formatMoneyAmount(d.paidAmount, currency)}
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
