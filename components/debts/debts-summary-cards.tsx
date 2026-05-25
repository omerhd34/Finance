"use client";

import { formatMoneyAmount } from "@/lib/common/utils";
import {
  convertDebtAssetToTry,
  formatDebtAssetAmount,
  isTryAssetUnit,
  type DebtAssetTryRates,
} from "@/lib/debts/debt-asset-units";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type DebtTotalsKey = {
  unit: string;
  symbol: string | null;
  qty: number;
};
export type DebtTotalsByUnit = ReadonlyArray<DebtTotalsKey>;

type Props = {
  totalsByUnitReceivable: DebtTotalsByUnit;
  totalsByUnitPayable: DebtTotalsByUnit;
  currency: string;
  tryRates: DebtAssetTryRates;
};

function pickTryAndOthers(totals: DebtTotalsByUnit) {
  let tryTotal = 0;
  const others: DebtTotalsKey[] = [];
  for (const t of totals) {
    if (isTryAssetUnit(t.unit)) {
      tryTotal += t.qty;
    } else if (t.qty > 0) {
      others.push(t);
    }
  }
  return { tryTotal, others };
}

function sumOthersAsTry(
  others: ReadonlyArray<DebtTotalsKey>,
  rates: DebtAssetTryRates,
): number | null {
  let sum = 0;
  let anyResolved = false;
  for (const o of others) {
    const t = convertDebtAssetToTry(o.qty, o.unit, rates, o.symbol);
    if (t == null) continue;
    sum += t;
    anyResolved = true;
  }
  return anyResolved ? sum : null;
}

function SummaryCard({
  title,
  totals,
  currency,
  tryRates,
  accentClass,
}: {
  title: string;
  totals: DebtTotalsByUnit;
  currency: string;
  tryRates: DebtAssetTryRates;
  accentClass: string;
}) {
  const { tryTotal, others } = pickTryAndOthers(totals);
  const hasOthers = others.length > 0;
  const othersAsTry = hasOthers ? sumOthersAsTry(others, tryRates) : null;
  const grandTotalTry = othersAsTry != null ? tryTotal + othersAsTry : null;

  return (
    <Card>
      <CardHeader className="gap-3 p-6 space-y-0">
        <CardDescription className="flex items-center gap-2">
          <span>{title}</span>
        </CardDescription>
        <CardTitle
          className={`text-2xl font-semibold leading-none tracking-tight tabular-nums ${accentClass}`}
        >
          {formatMoneyAmount(tryTotal, currency)}
        </CardTitle>
        {grandTotalTry != null && grandTotalTry !== tryTotal ? (
          <p className="text-xs text-muted-foreground tabular-nums">
            Tüm birimler dahil ≈ {formatMoneyAmount(grandTotalTry, currency)}{" "}
            (anlık fiyat)
          </p>
        ) : null}
      </CardHeader>
      {hasOthers ? (
        <CardContent className="px-6 pb-6 pt-0">
          <div className="flex flex-wrap gap-2">
            {others.map((o) => {
              const tryValue = convertDebtAssetToTry(
                o.qty,
                o.unit,
                tryRates,
                o.symbol,
              );
              const key = `${o.unit}::${o.symbol ?? ""}`;
              return (
                <span
                  key={key}
                  className="inline-flex flex-col items-start rounded-md border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-foreground tabular-nums"
                >
                  <span>{formatDebtAssetAmount(o.qty, o.unit, o.symbol)}</span>
                  {tryValue != null ? (
                    <span className="text-[10px] font-normal text-muted-foreground">
                      ≈ {formatMoneyAmount(tryValue, currency)}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

export function DebtsSummaryCards({
  totalsByUnitReceivable,
  totalsByUnitPayable,
  currency,
  tryRates,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SummaryCard
        title="Kalan toplam alacak"
        totals={totalsByUnitReceivable}
        currency={currency}
        tryRates={tryRates}
        accentClass="text-emerald-500"
      />
      <SummaryCard
        title="Kalan toplam borç"
        totals={totalsByUnitPayable}
        currency={currency}
        tryRates={tryRates}
        accentClass="text-amber-500"
      />
    </div>
  );
}
