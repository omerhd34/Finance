import Link from "next/link";
import { ArrowUpRight, Bitcoin, Coins, LineChart, Wallet } from "lucide-react";
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

type Props = {
  planPremium: boolean;
  currency: string;
  stockSummary: InvestmentAggregate;
  fxSummary: InvestmentAggregate;
  cryptoSummary: InvestmentAggregate;
  goldSummary: InvestmentAggregate;
};

export function DashboardInvestmentSection({
  planPremium,
  currency,
  stockSummary,
  fxSummary,
  cryptoSummary,
  goldSummary,
}: Props) {
  if (!planPremium) {
    return null;
  }

  const hasStockPositions = stockSummary.count > 0;
  const hasFxPositions = fxSummary.count > 0;
  const hasCryptoPositions = cryptoSummary.count > 0;

  return (
    <div className="grid min-w-0 gap-6 sm:grid-cols-2 lg:gap-8">
      {hasStockPositions ? (
        <Card className="min-w-0 border-border/50 bg-linear-to-br from-card via-card to-muted/15 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
            <div className="min-w-0 space-y-2">
              <CardTitle className="flex items-center gap-3 text-lg leading-tight">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 text-violet-600 ring-1 ring-violet-500/25 dark:text-violet-300">
                  <LineChart className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <span className="min-w-0">Hisse Senedi</span>
              </CardTitle>
              <div className="min-h-6">
                <CardDescription>
                  Hisse kayıtlarınızın toplam maliyet, güncel değer ve tahmini
                  kar/zarar özeti
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <Link href="/yatirimlar" className="gap-1.5">
                Yatırımlar
                <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="min-w-0 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
            <InvestmentPositionStats
              summary={stockSummary}
              currency={currency}
            />
          </CardContent>
        </Card>
      ) : null}

      {hasFxPositions ? (
        <Card className="min-w-0 border-border/50 bg-linear-to-br from-card via-card to-muted/15 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
            <div className="min-w-0 space-y-2">
              <CardTitle className="flex items-center gap-3 text-lg leading-tight">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/12 text-sky-700 ring-1 ring-sky-500/25 dark:text-sky-300">
                  <Wallet className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <span className="min-w-0">Döviz</span>
              </CardTitle>
              <div className="min-h-6">
                <CardDescription>
                  Döviz pozisyonlarınızın toplam maliyet, güncel değer ve
                  tahmini kar/zarar özeti
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <Link href="/yatirimlar" className="gap-1.5">
                Yatırımlar
                <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="min-w-0 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
            <InvestmentPositionStats summary={fxSummary} currency={currency} />
          </CardContent>
        </Card>
      ) : null}

      {hasCryptoPositions ? (
        <Card className="min-w-0 border-border/50 bg-linear-to-br from-card via-card to-muted/15 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
            <div className="min-w-0 space-y-2">
              <CardTitle className="flex items-center gap-3 text-lg leading-tight">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/12 text-orange-700 ring-1 ring-orange-500/25 dark:text-orange-300">
                  <Bitcoin className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <span className="min-w-0">Kripto</span>
              </CardTitle>
              <div className="min-h-6">
                <CardDescription>
                  Kripto pozisyonlarınızın toplam maliyet, güncel değer ve
                  tahmini kar/zarar özeti
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <Link href="/yatirimlar" className="gap-1.5">
                Yatırımlar
                <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="min-w-0 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
            <InvestmentPositionStats
              summary={cryptoSummary}
              currency={currency}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card className="min-w-0 border-border/50 bg-linear-to-br from-card via-card to-muted/15 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
          <div className="min-w-0 space-y-2">
            <CardTitle className="flex items-center gap-3 text-lg leading-tight">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-800 ring-1 ring-amber-500/25 dark:text-amber-300">
                <Coins className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0">Altın</span>
            </CardTitle>
            <div className="min-h-6">
              <CardDescription>
                Altın kayıtlarınızın toplam maliyet, güncel değer ve tahmini
                kar/zarar özeti
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link href="/yatirimlar" className="gap-1.5">
              Yatırımlar
              <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="min-w-0 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
          {goldSummary.count === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Henüz altın kaydı yok.{" "}
                <Link
                  href="/yatirimlar"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Kayıt ekleyin
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
