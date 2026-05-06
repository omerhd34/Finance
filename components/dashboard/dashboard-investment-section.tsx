"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Bitcoin,
  Coins,
  ExternalLink,
  LineChart,
  Package,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  InvestmentPositionStats,
  type InvestmentAggregate,
} from "@/components/dashboard/investment-position-stats";

type AssetKey = "STOCK" | "FX" | "CRYPTO" | "GOLD" | "COMMODITY";

type InvestmentCardConfig = {
  key: AssetKey;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconClassName: string;
  summary: InvestmentAggregate;
};

const DEFAULT_ORDER: AssetKey[] = [
  "GOLD",
  "FX",
  "STOCK",
  "COMMODITY",
  "CRYPTO",
];

type Props = {
  planPremium: boolean;
  currency: string;
  stockSummary: InvestmentAggregate;
  fxSummary: InvestmentAggregate;
  cryptoSummary: InvestmentAggregate;
  commoditySummary: InvestmentAggregate;
  goldSummary: InvestmentAggregate;
};

export function DashboardInvestmentSection({
  planPremium,
  currency,
  stockSummary,
  fxSummary,
  cryptoSummary,
  commoditySummary,
  goldSummary,
}: Props) {
  const visibleCards = useMemo<InvestmentCardConfig[]>(() => {
    if (!planPremium) return [];
    return [
      {
        key: "GOLD" as const,
        title: "Altın",
        description:
          "Altın kayıtlarınızın toplam maliyet, güncel değer ve tahmini kar/zarar özeti",
        icon: Coins,
        iconClassName:
          "bg-amber-500/12 text-amber-800 ring-amber-500/25 dark:text-amber-300",
        summary: goldSummary,
      },
      {
        key: "FX" as const,
        title: "Döviz",
        description:
          "Döviz pozisyonlarınızın toplam maliyet, güncel değer ve tahmini kar/zarar özeti",
        icon: Wallet,
        iconClassName:
          "bg-sky-500/12 text-sky-700 ring-sky-500/25 dark:text-sky-300",
        summary: fxSummary,
      },
      {
        key: "STOCK" as const,
        title: "Hisse Senedi",
        description:
          "Hisse kayıtlarınızın toplam maliyet, güncel değer ve tahmini kar/zarar özeti",
        icon: LineChart,
        iconClassName:
          "bg-violet-500/12 text-violet-600 ring-violet-500/25 dark:text-violet-300",
        summary: stockSummary,
      },
      {
        key: "COMMODITY" as const,
        title: "Emtia",
        description:
          "Emtia ile eski gümüş/platin (gram) kayıtlarınızın toplam maliyet, güncel değer ve tahmini kar/zarar özeti",
        icon: Package,
        iconClassName:
          "bg-lime-500/12 text-lime-800 ring-lime-500/25 dark:text-lime-300",
        summary: commoditySummary,
      },
      {
        key: "CRYPTO" as const,
        title: "Kripto",
        description:
          "Kripto pozisyonlarınızın toplam maliyet, güncel değer ve tahmini kar/zarar özeti",
        icon: Bitcoin,
        iconClassName:
          "bg-orange-500/12 text-orange-700 ring-orange-500/25 dark:text-orange-300",
        summary: cryptoSummary,
      },
    ].filter((card) => card.summary.count > 0);
  }, [
    planPremium,
    stockSummary,
    fxSummary,
    cryptoSummary,
    commoditySummary,
    goldSummary,
  ]);

  const orderedCards = useMemo(() => {
    const rank = new Map(DEFAULT_ORDER.map((k, i) => [k, i] as const));
    return [...visibleCards].sort(
      (a, b) => (rank.get(a.key) ?? 999) - (rank.get(b.key) ?? 999),
    );
  }, [visibleCards]);

  const visibleCardCount = orderedCards.length;

  if (!planPremium || visibleCardCount === 0) {
    return null;
  }

  return (
    <div
      className={`grid min-w-0 gap-6 ${
        visibleCardCount === 1 ? "grid-cols-1" : "sm:grid-cols-2"
      } lg:gap-8`}
    >
      {orderedCards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.key}
            className="min-w-0 overflow-hidden border-border/50 bg-linear-to-br from-card via-card to-muted/15 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
          >
            <div className="space-y-1 border-b border-border bg-muted/30 px-5 py-5 sm:px-6 sm:py-6">
              <div className="grid w-full min-w-0 grid-cols-1 gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-3.5 sm:gap-y-0">
                <div className="flex min-w-0 items-center gap-3.5 sm:contents">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${card.iconClassName}`}
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="min-w-0 flex-1 text-lg font-semibold leading-tight tracking-tight sm:min-w-0">
                    {card.title}
                  </h3>
                </div>
                <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 sm:w-auto"
                    asChild
                  >
                    <Link
                      href="/yatirimlar"
                      className="w-full justify-center gap-1.5 sm:w-auto"
                    >
                      Yatırımlar
                      <ExternalLink
                        className="h-3.5 w-3.5 opacity-70"
                        aria-hidden
                      />
                    </Link>
                  </Button>
                </div>
              </div>
              <p className="min-w-0 pl-14.5 text-sm leading-snug text-muted-foreground">
                {card.description}
              </p>
            </div>
            <div className="min-w-0 p-4 sm:p-6">
              <InvestmentPositionStats
                summary={card.summary}
                currency={currency}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
