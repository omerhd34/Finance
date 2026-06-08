/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DashboardKpiSection } from "@/components/dashboard/dashboard-kpi-section";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { DashboardActionAlertsCard } from "@/components/dashboard/dashboard-action-alerts-card";
import { DashboardPremiumPromo } from "@/components/dashboard/dashboard-premium-promo";
import { DashboardEmailVerificationBanner } from "@/components/dashboard/dashboard-email-verification-banner";
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";
import { NewRecurringDialog } from "@/components/recurring/new-recurring-dialog";
import { NewTransactionDialog } from "@/components/transactions/new-transaction-dialog";
import { DataLoadingShell } from "@/components/ui/data-loading-shell";
import { buildRecurringRulePayload } from "@/lib/recurring/recurring-payload";
import type { RecurringFormValues } from "@/lib/recurring/recurring-schema";
import { apiClient } from "@/lib/client/api-client";
import { totalInvestmentPnlTry } from "@/lib/investments/investment-position-math";
import { useCommodityLiveQuotes } from "@/hooks/use-commodity-live-quotes";
import { useCryptoLiveQuotes } from "@/hooks/use-crypto-live-quotes";
import { useFxLiveQuotes } from "@/hooks/use-fx-live-quotes";
import { useGoldLivePrices } from "@/hooks/use-gold-live-prices";
import { usePlatinumLivePrices } from "@/hooks/use-platinum-live-prices";
import { useSilverLivePrices } from "@/hooks/use-silver-live-prices";
import { useStockLiveQuotes } from "@/hooks/use-stock-live-quotes";
import { debtRemaining } from "@/lib/debts/debt-remaining";
import { isTryAssetUnit } from "@/lib/debts/debt-asset-units";
import type { Debt } from "@/types/debt";
import type { InvestmentPosition } from "@/types/investment";
import type { Transaction } from "@/types/transaction";
import {
  getLastNMonthsPeriodRange,
  lastNMonthsBars,
  sumByTypeInRange,
} from "@/lib/dashboard/dashboard-stats";
import { computeFinancialHealthScore } from "@/lib/dashboard/financial-health-score";
import {
  buildDashboardAlerts,
  type CategoryBudgetSnapshot,
} from "@/lib/dashboard/dashboard-anomalies";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addRecurringRule,
  processDueRecurring,
} from "@/store/slices/recurringSlice";
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
  const [budgets, setBudgets] = useState<CategoryBudgetSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [newRecurringOpen, setNewRecurringOpen] = useState(false);
  const [newBudgetOpen, setNewBudgetOpen] = useState(false);
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
      const [txRes, debtRes, budgetRes] = await Promise.all([
        apiClient.get<{ items: Transaction[] }>("/api/transactions?limit=2000"),
        apiClient.get<{ items: Debt[] }>("/api/debts"),
        apiClient
          .get<{ items: CategoryBudgetSnapshot[] }>("/api/category-budgets")
          .catch(() => ({ data: { items: [] as CategoryBudgetSnapshot[] } })),
      ]);
      setItems(txRes.data.items);
      setDebts(debtRes.data.items);
      setBudgets(budgetRes.data.items);
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
      let receivable = 0;
      let payable = 0;
      for (const d of debtRes.data.items) {
        if (!isTryAssetUnit(d.assetUnit)) continue;
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
      setBudgets([]);
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
    const epoch = new Date(0);
    const net =
      sumByTypeInRange(items, "income", epoch, kpiPeriodEnd) -
      sumByTypeInRange(items, "expense", epoch, kpiPeriodEnd);
    const bars = lastNMonthsBars(items, 6, now, monthStartDay);
    return {
      totalIncome,
      totalExpense,
      net,
      bars,
    };
  }, [items, kpiPeriodStart, kpiPeriodEnd, now, monthStartDay]);

  const investmentPnl = useMemo(
    () => totalInvestmentPnlTry(investmentPositions, liveQuotes),
    [investmentPositions, liveQuotes],
  );

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

  const dashboardAlerts = useMemo(
    () =>
      buildDashboardAlerts({
        items,
        debts,
        budgets,
        now,
        monthStartDay,
        currency,
      }),
    [items, debts, budgets, now, monthStartDay, currency],
  );

  const handleCreateRecurring = useCallback(
    async (
      values: RecurringFormValues,
      amountEntryCurrency: string,
    ) => {
      await dispatch(
        addRecurringRule(
          buildRecurringRulePayload(values, amountEntryCurrency),
        ),
      ).unwrap();
      void load();
    },
    [dispatch, load],
  );

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
    <DataLoadingShell ready={!loading}>
      <div className="space-y-8">
        <DashboardEmailVerificationBanner />
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

        <DashboardQuickActions
          onNewTransaction={() => setNewTransactionOpen(true)}
          onAddRecurring={() => setNewRecurringOpen(true)}
          onAddBudget={() => setNewBudgetOpen(true)}
        />

        <DashboardActionAlertsCard alerts={dashboardAlerts} />

        <NewTransactionDialog
          hideTrigger
          open={newTransactionOpen}
          onOpenChange={setNewTransactionOpen}
          onCreated={load}
        />

        <NewRecurringDialog
          hideTrigger
          open={newRecurringOpen}
          onOpenChange={setNewRecurringOpen}
          onSubmit={handleCreateRecurring}
        />

        <BudgetFormDialog
          open={newBudgetOpen}
          onOpenChange={setNewBudgetOpen}
          editing={null}
          onSaved={load}
        />
      </div>
    </DataLoadingShell>
  );
}
