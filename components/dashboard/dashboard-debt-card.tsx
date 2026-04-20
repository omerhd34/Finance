import Link from "next/link";
import { ArrowRight, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { currencySymbolLabel, formatMoneyAmount } from "@/lib/utils";

type Props = {
  receivable: number;
  payable: number;
  currency: string;
};

export function DashboardDebtCard({ receivable, payable, currency }: Props) {
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
              Borç ve Alacak Özeti
            </h3>
            <p className="text-sm leading-snug text-muted-foreground">
              Yapılan ödemeler düşülmüş güncel kalan bakiyeler
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
            Detaylar
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6">
        <div className="pointer-events-none select-none rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600/90 dark:text-emerald-400/90">
            Toplam alacak ({currencySymbolLabel(currency)})
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatMoneyAmount(receivable, currency)}
          </p>
        </div>
        <div className="pointer-events-none select-none rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700/90 dark:text-amber-400/90">
            Toplam borç ({currencySymbolLabel(currency)})
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-amber-600 dark:text-amber-400">
            {formatMoneyAmount(payable, currency)}
          </p>
        </div>
      </div>
    </Card>
  );
}
