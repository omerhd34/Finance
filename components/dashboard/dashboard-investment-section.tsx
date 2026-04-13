import Link from "next/link";
import { ArrowUpRight, Coins, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InvestmentPositionStats,
  type InvestmentAggregate,
} from "@/components/dashboard/investment-position-stats";
import { currencySymbolLabel } from "@/lib/utils";

type Props = {
  currency: string;
  stockSummary: InvestmentAggregate;
  goldSummary: InvestmentAggregate;
};

export function DashboardInvestmentSection({
  currency,
  stockSummary,
  goldSummary,
}: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-border/50 bg-linear-to-br from-card via-card to-muted/15 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
          <div className="min-w-0 space-y-1.5">
            <CardTitle className="flex items-center gap-3 text-lg leading-tight">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 text-violet-600 ring-1 ring-violet-500/25 dark:text-violet-300">
                <LineChart className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0">
                Hisse Senedi ({currencySymbolLabel(currency)})
              </span>
            </CardTitle>
            <CardDescription className="text-pretty">
              Kayıtlı hisse pozisyonlarınızın toplam maliyet, güncel değer ve
              tahmini kar/zarar özeti
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link href="/investments" className="gap-1.5">
              Yatırımlar
              <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stockSummary.count === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Henüz hisse pozisyonu yok.{" "}
                <Link
                  href="/investments"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Pozisyon ekleyin
                </Link>
              </p>
            </div>
          ) : (
            <InvestmentPositionStats
              summary={stockSummary}
              currency={currency}
            />
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-linear-to-br from-card via-card to-muted/15 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
          <div className="min-w-0 space-y-1.5">
            <CardTitle className="flex items-center gap-3 text-lg leading-tight">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-800 ring-1 ring-amber-500/25 dark:text-amber-300">
                <Coins className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0">
                Altın ({currencySymbolLabel(currency)})
              </span>
            </CardTitle>
            <CardDescription className="text-pretty">
              Kayıtlı altın pozisyonlarınızın toplam maliyet, güncel değer ve
              tahmini kar/zarar özeti
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link href="/investments" className="gap-1.5">
              Yatırımlar
              <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {goldSummary.count === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Henüz altın pozisyonu yok.{" "}
                <Link
                  href="/investments"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Pozisyon ekleyin
                </Link>
              </p>
            </div>
          ) : (
            <InvestmentPositionStats
              summary={goldSummary}
              currency={currency}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
