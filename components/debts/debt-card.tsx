"use client";

import { differenceInCalendarDays } from "date-fns";
import { debtProgressPercent, debtRemaining } from "@/lib/debt-remaining";
import { formatDateTR, formatMoney } from "@/lib/utils";
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
  const daysLeft = d.dueDate
    ? differenceInCalendarDays(new Date(d.dueDate), new Date())
    : null;

  return (
    <Card className={settled ? "opacity-75" : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 pr-2">{d.counterparty}</CardTitle>
          {settled && (
            <Badge variant="secondary" className="shrink-0">
              Kapandı
            </Badge>
          )}
        </div>
        <CardDescription>
          Kalan: {formatMoney(rem, currency)} · Toplam:{" "}
          {formatMoney(d.totalAmount, currency)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={debtProgressPercent(d)} />
        <p className="text-xs text-muted-foreground">
          Ödenen: {formatMoney(d.paidAmount, currency)}
          {d.dueDate
            ? ` · Vade: ${formatDateTR(d.dueDate)}${
                !settled && daysLeft !== null
                  ? ` · ${daysLeft >= 0 ? `${daysLeft} gün kaldı` : `${Math.abs(daysLeft)} gün geçti`}`
                  : ""
              }`
            : ""}
        </p>
        {d.note ? (
          <p className="text-xs text-muted-foreground line-clamp-3">
            {d.note}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={settled}
          onClick={onPay}
        >
          Ödeme ekle
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit}>
          Düzenle
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={onDelete}
        >
          Sil
        </Button>
      </CardFooter>
    </Card>
  );
}
