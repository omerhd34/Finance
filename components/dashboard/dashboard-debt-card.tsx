import { HandCoins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardSectionActionLink } from "@/components/dashboard/dashboard-section-action-link";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { debtRemaining } from "@/lib/debts/debt-remaining";
import type { Debt } from "@/types/debt";
import { formatMoneyAmount } from "@/lib/common/utils";

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
      <DashboardSectionHeader
        icon={HandCoins}
        title="Borç ve Alacaklar"
        description="Bana borçlu olanlar ve benim borçlarım"
        action={<DashboardSectionActionLink href="/borc-ve-alacak" label="Tümünü gör" />}
      />

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-4 sm:px-5 sm:py-5">
          <div className="mb-3 flex items-end justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600/90 dark:text-emerald-400/90">
              Bana borçlular
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
              Benim borçlarım
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
