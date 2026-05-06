/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DashboardKpiSection } from "@/components/dashboard/dashboard-kpi-section";
import { DashboardChartsSection } from "@/components/dashboard/dashboard-charts-section";
import { DashboardRecurringCard } from "@/components/dashboard/dashboard-recurring-card";
import { DashboardDebtCard } from "@/components/dashboard/dashboard-debt-card";
import { DashboardInvestmentSection } from "@/components/dashboard/dashboard-investment-section";
import { DashboardPremiumPromo } from "@/components/dashboard/dashboard-premium-promo";
import { AiMessagingDigestCopyButton } from "@/components/ai-insights/ai-messaging-digest-copy-button";
import { DashboardRecentTransactionsCard } from "@/components/dashboard/dashboard-recent-transactions-card";
import { LogoLoading } from "@/components/ui/logo-loading";
import { apiClient } from "@/lib/client/api-client";
import {
  aggregatePositionsTry,
  totalInvestmentPnlTry,
} from "@/lib/investments/investment-position-math";
import { useCommodityLiveQuotes } from "@/hooks/use-commodity-live-quotes";
import { useCryptoLiveQuotes } from "@/hooks/use-crypto-live-quotes";
import { useFxLiveQuotes } from "@/hooks/use-fx-live-quotes";
import { useGoldLivePrices } from "@/hooks/use-gold-live-prices";
import { usePlatinumLivePrices } from "@/hooks/use-platinum-live-prices";
import { useSilverLivePrices } from "@/hooks/use-silver-live-prices";
import { useStockLiveQuotes } from "@/hooks/use-stock-live-quotes";
import { debtRemaining } from "@/lib/debts/debt-remaining";
import type { Debt } from "@/types/debt";
import type { InvestmentPosition } from "@/types/investment";
import type { RecurringRule } from "@/types/recurring";
import type { Transaction } from "@/types/transaction";
import {
  expenseByCategoryForLastNMonths,
  formatPeriodRangeLabel,
  getLastNMonthsPeriodRange,
  lastNMonthsBars,
  sumByTypeInRange,
} from "@/lib/dashboard/dashboard-stats";
import { computeFinancialHealthScore } from "@/lib/dashboard/financial-health-score";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { processDueRecurring } from "@/store/slices/recurringSlice";
import { normalizePlanTier } from "@/lib/premium/plan-tier";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const monthStartDay = useAppSelector((s) => s.auth.user?.monthStartDay ?? 1);
  const reduxPlanTier = useAppSelector((s) => s.auth.user?.planTier);
  const planPremium =
    normalizePlanTier(reduxPlanTier ?? session?.user?.planTier) === "premium";
  const [items, setItems] = useState<Transaction[]>([]);
  const [investmentPositions, setInvestmentPositions] = useState<
    InvestmentPosition[]
  >([]);
  const [debtTotals, setDebtTotals] = useState<{
    receivable: number;
    payable: number;
  } | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [barsChartMonths, setBarsChartMonths] = useState(6);
  const [pieChartMonths, setPieChartMonths] = useState(1);
  const [digestCopyError, setDigestCopyError] = useState<string | null>(null);
  const goldLive = useGoldLivePrices(planPremium);
  const silverLive = useSilverLivePrices(planPremium);
  const platinumLive = usePlatinumLivePrices(planPremium);
  const stockLive = useStockLiveQuotes(planPremium);
  const fxLive = useFxLiveQuotes(planPremium);
  const cryptoLive = useCryptoLiveQuotes(planPremium);
  const commodityLive = useCommodityLiveQuotes(planPremium);
  const liveQuotes = useMemo(
    () => ({
      gold: goldLive.prices,
      silverTryPerGram:
        typeof silverLive.priceTryPerGram === "number"
          ? silverLive.priceTryPerGram
          : undefined,
      platinumTryPerGram:
        typeof platinumLive.priceTryPerGram === "number"
          ? platinumLive.priceTryPerGram
          : undefined,
      stockByTicker: stockLive.byTicker,
      fxByCode: fxLive.byCode,
      cryptoByTicker: cryptoLive.byTicker,
      commodityByTicker: commodityLive.byTicker,
    }),
    [
      goldLive.prices,
      silverLive.priceTryPerGram,
      platinumLive.priceTryPerGram,
      stockLive.byTicker,
      fxLive.byCode,
      cryptoLive.byTicker,
      commodityLive.byTicker,
    ],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      try {
        await dispatch(processDueRecurring()).unwrap();
      } catch {}
      const [txRes, debtRes, recRes] = await Promise.all([
        apiClient.get<{ items: Transaction[] }>("/api/transactions?limit=2000"),
        apiClient.get<{ items: Debt[] }>("/api/debts"),
        apiClient.get<{ items: RecurringRule[] }>("/api/recurring"),
      ]);
      setItems(txRes.data.items);
      setDebts(debtRes.data.items);
      if (planPremium) {
        try {
          const invRes = await apiClient.get<{ items: InvestmentPosition[] }>(
            "/api/investments",
          );
          setInvestmentPositions(invRes.data.items);
        } catch {
          setInvestmentPositions([]);
        }
      } else {
        setInvestmentPositions([]);
      }
      setRecurringRules(recRes.data.items);
      let receivable = 0;
      let payable = 0;
      for (const d of debtRes.data.items) {
        const r = debtRemaining(d);
        if (d.direction === "RECEIVABLE") receivable += r;
        else payable += r;
      }
      setDebtTotals({ receivable, payable });
    } catch {
      setError("Veriler yüklenemedi");
      setInvestmentPositions([]);
      setDebtTotals(null);
      setDebts([]);
      setRecurringRules([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch, planPremium]);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const { start: kpiPeriodStart, end: kpiPeriodEnd } =
    getLastNMonthsPeriodRange(1, now, monthStartDay);

  const stats = useMemo(() => {
    const totalIncome = sumByTypeInRange(
      items,
      "income",
      kpiPeriodStart,
      kpiPeriodEnd,
    );
    const totalExpense = sumByTypeInRange(
      items,
      "expense",
      kpiPeriodStart,
      kpiPeriodEnd,
    );
    const net = totalIncome - totalExpense;
    const bars = lastNMonthsBars(items, barsChartMonths, now, monthStartDay);
    const pie = expenseByCategoryForLastNMonths(
      items,
      pieChartMonths,
      now,
      monthStartDay,
    );
    const recent = [...items]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    return {
      totalIncome,
      totalExpense,
      net,
      bars,
      pie,
      recent,
    };
  }, [
    items,
    kpiPeriodStart,
    kpiPeriodEnd,
    now,
    barsChartMonths,
    pieChartMonths,
    monthStartDay,
  ]);

  const barsRangeLabel = useMemo(() => {
    const { start, end } = getLastNMonthsPeriodRange(
      barsChartMonths,
      now,
      monthStartDay,
    );
    return formatPeriodRangeLabel(start, end);
  }, [barsChartMonths, now, monthStartDay]);

  const pieRangeLabel = useMemo(() => {
    const { start, end } = getLastNMonthsPeriodRange(
      pieChartMonths,
      now,
      monthStartDay,
    );
    return formatPeriodRangeLabel(start, end);
  }, [pieChartMonths, now, monthStartDay]);

  const investmentPnl = useMemo(
    () => totalInvestmentPnlTry(investmentPositions, liveQuotes),
    [investmentPositions, liveQuotes],
  );

  const investmentPnlBreakdown = useMemo(() => {
    const gold = aggregatePositionsTry(investmentPositions, "GOLD", liveQuotes);
    const fx = aggregatePositionsTry(investmentPositions, "FX", liveQuotes);
    const stock = aggregatePositionsTry(
      investmentPositions,
      "STOCK",
      liveQuotes,
    );
    const crypto = aggregatePositionsTry(
      investmentPositions,
      "CRYPTO",
      liveQuotes,
    );
    const c = aggregatePositionsTry(
      investmentPositions,
      "COMMODITY",
      liveQuotes,
    );
    const pt = aggregatePositionsTry(
      investmentPositions,
      "PLATINUM",
      liveQuotes,
    );
    const ag = aggregatePositionsTry(investmentPositions, "SILVER", liveQuotes);
    const commodityCount = c.count + pt.count + ag.count;
    const commodityPnl = c.pnlTry + pt.pnlTry + ag.pnlTry;

    const entries: { label: string; pnlTry: number; count: number }[] = [
      { label: "Altın", pnlTry: gold.pnlTry, count: gold.count },
      { label: "Döviz", pnlTry: fx.pnlTry, count: fx.count },
      { label: "Hisse senedi", pnlTry: stock.pnlTry, count: stock.count },
      { label: "Emtia", pnlTry: commodityPnl, count: commodityCount },
      { label: "Kripto", pnlTry: crypto.pnlTry, count: crypto.count },
    ];

    return entries
      .filter((e) => e.count > 0)
      .map(({ label, pnlTry }) => ({
        label,
        pnlTry,
      }));
  }, [investmentPositions, liveQuotes]);

  const financialHealth = useMemo(
    () =>
      computeFinancialHealthScore({
        monthIncome: stats.totalIncome,
        monthExpense: stats.totalExpense,
        debtReceivable: debtTotals?.receivable ?? 0,
        debtPayable: debtTotals?.payable ?? 0,
        monthlyBars: stats.bars,
        investmentPnl: planPremium ? investmentPnl : undefined,
      }),
    [stats, debtTotals, planPremium, investmentPnl],
  );

  const upcomingRecurring = useMemo(() => {
    return [...recurringRules]
      .filter((r) => r.isActive)
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "income" ? -1 : 1;
        }
        return (
          new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
        );
      })
      .slice(0, 4);
  }, [recurringRules]);

  const activeRecurringCount = useMemo(
    () => recurringRules.filter((r) => r.isActive).length,
    [recurringRules],
  );

  if (loading) {
    return <LogoLoading />;
  }

  if (error) {
    return (
      <p className="text-destructive">
        {error}{" "}
        <Button variant="link" onClick={() => load()}>
          Tekrar dene
        </Button>
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {!planPremium ? <DashboardPremiumPromo /> : null}

      <DashboardKpiSection
        currency={currency}
        totalIncome={stats.totalIncome}
        totalExpense={stats.totalExpense}
        net={stats.net}
        financialHealth={financialHealth}
        debtNetBalance={
          debtTotals ? debtTotals.receivable - debtTotals.payable : undefined
        }
        investmentPnl={planPremium ? investmentPnl : undefined}
      />

      <DashboardChartsSection
        bars={stats.bars}
        pie={stats.pie}
        barsMonths={barsChartMonths}
        pieMonths={pieChartMonths}
        barsRangeLabel={barsRangeLabel}
        pieRangeLabel={pieRangeLabel}
        onBarsMonthsChange={setBarsChartMonths}
        onPieMonthsChange={setPieChartMonths}
      />

      <DashboardRecurringCard
        activeRecurringCount={activeRecurringCount}
        upcomingRecurring={upcomingRecurring}
        currency={currency}
      />

      {debtTotals ? (
        <DashboardDebtCard
          items={debts}
          receivable={debtTotals.receivable}
          payable={debtTotals.payable}
          currency={currency}
        />
      ) : null}

      {planPremium && investmentPositions.length > 0 ? (
        <DashboardInvestmentSection
          currency={currency}
          totalPnlTry={investmentPnl}
          breakdown={investmentPnlBreakdown}
        />
      ) : null}

      <DashboardRecentTransactionsCard
        transactions={stats.recent}
        currency={currency}
      />

      <section
        className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-muted/25 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        aria-label="Finans özeti — panoya kopyala"
      >
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Güncel işlemleriniz ile borç ve alacak özetinizi tek tıkla panoya
          kopyalayın; raporda kullanın, not olarak saklayın veya paylaşın.
        </p>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <AiMessagingDigestCopyButton
            className="w-full sm:w-auto"
            onCopyError={setDigestCopyError}
          />
          {digestCopyError ? (
            <p className="text-sm text-destructive sm:text-end" role="alert">
              {digestCopyError}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
