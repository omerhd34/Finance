import Link from "next/link";
import { ArrowRight, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { debtRemaining } from "@/lib/debt-remaining";
import type { Debt } from "@/types/debt";
import { currencySymbolLabel, formatMoneyAmount } from "@/lib/utils";

type Props = {
  items: Debt[];
  receivable: number;
  payable: number;
  currency: string;
};

export function DashboardDebtCard({
  items,
  receivable,
  payable,
  currency,
}: Props) {
  const receivables = items
    .filter((d) => d.direction === "RECEIVABLE" && debtRemaining(d) > 0)
    .sort((a, b) => debtRemaining(b) - debtRemaining(a))
    .slice(0, 3);
  const payables = items
    .filter((d) => d.direction === "PAYABLE" && debtRemaining(d) > 0)
    .sort((a, b) => debtRemaining(b) - debtRemaining(a))
    .slice(0, 3);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border bg-muted/30 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6 sm:py-6">
        <div className="flex min-w-0 gap-3.5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15"
            aria-hidden
          >
            <HandCoins className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-1.5 pt-0.5">
            <h3 className="text-lg font-semibold leading-tight tracking-tight">
              Borç ve Alacaklar
            </h3>
            <p className="text-sm leading-snug text-muted-foreground">
              Bana borçlu olanlar ve benim borçlarım
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          asChild
        >
          <Link href="/borc-ve-alacak">
            Tümünü gör
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-4 sm:px-5 sm:py-5">
          <div className="mb-3 flex items-end justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600/90 dark:text-emerald-400/90">
              Bana borçlular ({currencySymbolLabel(currency)})
            </p>
            <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatMoneyAmount(receivable, currency)}
            </p>
          </div>
          {receivables.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Aktif alacak kaydı yok.
            </p>
          ) : (
            <ul className="space-y-2">
              {receivables.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="truncate text-sm font-medium">
                    {d.counterparty}
                  </span>
                  <span className="shrink-0 text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatMoneyAmount(debtRemaining(d), currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-4 sm:px-5 sm:py-5">
          <div className="mb-3 flex items-end justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700/90 dark:text-amber-400/90">
              Benim borçlarım ({currencySymbolLabel(currency)})
            </p>
            <p className="text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
              {formatMoneyAmount(payable, currency)}
            </p>
          </div>
          {payables.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Aktif borç kaydı yok.
            </p>
          ) : (
            <ul className="space-y-2">
              {payables.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="truncate text-sm font-medium">
                    {d.counterparty}
                  </span>
                  <span className="shrink-0 text-sm tabular-nums text-amber-600 dark:text-amber-400">
                    {formatMoneyAmount(debtRemaining(d), currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
