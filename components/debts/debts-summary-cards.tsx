"use client";

import { formatMoney } from "@/lib/utils";
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
        <CardHeader className="pb-2">
          <CardDescription>Toplam alacak (kalan)</CardDescription>
          <CardTitle className="text-2xl text-emerald-500">
            {formatMoney(totalReceivable, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Toplam borç (kalan)</CardDescription>
          <CardTitle className="text-2xl text-amber-500">
            {formatMoney(totalPayable, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
