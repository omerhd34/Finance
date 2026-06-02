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
import type {
  DebtTotalsByUnit,
  DebtTotalsKey,
} from "@/components/debts/debts-summary-cards";

type Props = {
  periodLabel: string;
  loadingPaid: boolean;
  paidThisPeriodReceivableTry: number;
  paidThisPeriodPayableTry: number;
  dueInPeriodReceivable: DebtTotalsByUnit;
  dueInPeriodPayable: DebtTotalsByUnit;
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

function PaidCard({
  title,
  periodLabel,
  loading,
  amountTry,
  currency,
  accentClass,
}: {
  title: string;
  periodLabel: string;
  loading: boolean;
  amountTry: number;
  currency: string;
  accentClass: string;
}) {
  return (
    <Card>
      <CardHeader className="gap-3 p-6 space-y-0">
        <CardDescription className="flex items-center justify-between gap-2">
          <span>{title}</span>
          <span className="text-[10px] font-normal text-muted-foreground">
            {periodLabel}
          </span>
        </CardDescription>
        <CardTitle
          className={`text-2xl font-semibold leading-none tracking-tight tabular-nums ${accentClass}`}
        >
          {loading ? "—" : formatMoneyAmount(amountTry, currency)}
        </CardTitle>
        <p className="text-xs text-muted-foreground tabular-nums">
          Borç/alacak kategorili işlemlerden hesaplanır.
        </p>
      </CardHeader>
    </Card>
  );
}

function DueCard({
  title,
  periodLabel,
  totals,
  currency,
  tryRates,
  accentClass,
}: {
  title: string;
  periodLabel: string;
  totals: DebtTotalsByUnit;
  currency: string;
  tryRates: DebtAssetTryRates;
  accentClass: string;
}) {
  const { tryTotal, others } = pickTryAndOthers(totals);
  const hasOthers = others.length > 0;
  const othersAsTry = hasOthers ? sumOthersAsTry(others, tryRates) : null;
  const grandTotalTry = othersAsTry != null ? tryTotal + othersAsTry : null;
  const hasAny = tryTotal > 0 || hasOthers;

  return (
    <Card>
      <CardHeader className="gap-3 p-6 space-y-0">
        <CardDescription className="flex items-center justify-between gap-2">
          <span>{title}</span>
          <span className="text-[10px] font-normal text-muted-foreground">
            {periodLabel}
          </span>
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
        ) : !hasAny ? (
          <p className="text-xs text-muted-foreground">
            Bu dönemde vadesi gelen kayıt yok.
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

export function DebtsPeriodSummaryCards({
  periodLabel,
  loadingPaid,
  paidThisPeriodReceivableTry,
  paidThisPeriodPayableTry,
  dueInPeriodReceivable,
  dueInPeriodPayable,
  currency,
  tryRates,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <PaidCard
        title="Bu dönem tahsil edilen alacak"
        periodLabel={periodLabel}
        loading={loadingPaid}
        amountTry={paidThisPeriodReceivableTry}
        currency={currency}
        accentClass="text-emerald-500"
      />
      <PaidCard
        title="Bu dönem ödenen borç"
        periodLabel={periodLabel}
        loading={loadingPaid}
        amountTry={paidThisPeriodPayableTry}
        currency={currency}
        accentClass="text-amber-500"
      />
      <DueCard
        title="Vadesi bu dönemde olan alacak"
        periodLabel={periodLabel}
        totals={dueInPeriodReceivable}
        currency={currency}
        tryRates={tryRates}
        accentClass="text-emerald-500"
      />
      <DueCard
        title="Vadesi bu dönemde olan borç"
        periodLabel={periodLabel}
        totals={dueInPeriodPayable}
        currency={currency}
        tryRates={tryRates}
        accentClass="text-amber-500"
      />
    </div>
  );
}
