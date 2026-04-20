/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardKpiSection } from "@/components/dashboard/dashboard-kpi-section";
import { DashboardDebtCard } from "@/components/dashboard/dashboard-debt-card";
import { DashboardChartsSection } from "@/components/dashboard/dashboard-charts-section";
import { DashboardRecurringCard } from "@/components/dashboard/dashboard-recurring-card";
import { DashboardInvestmentSection } from "@/components/dashboard/dashboard-investment-section";
import { DashboardPremiumPromo } from "@/components/dashboard/dashboard-premium-promo";
import { DashboardRecentTransactionsCard } from "@/components/dashboard/dashboard-recent-transactions-card";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { apiClient } from "@/lib/api-client";
import {
  aggregatePositionsTry,
  totalInvestmentPnlTry,
} from "@/lib/investment-position-math";
import { debtRemaining } from "@/lib/debt-remaining";
import type { Debt } from "@/types/debt";
import type { InvestmentPosition } from "@/types/investment";
import type { RecurringRule } from "@/types/recurring";
import type { Transaction } from "@/types/transaction";
import {
  expenseByCategoryForMonth,
  lastNMonthsBars,
  sumByType,
  sumExpenseInRange,
} from "@/lib/dashboard-stats";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { processDueRecurring } from "@/store/slices/recurringSlice";
import { endOfMonth, startOfMonth } from "date-fns";
import { normalizePlanTier } from "@/lib/plan-tier";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const planPremium =
    normalizePlanTier(useAppSelector((s) => s.auth.user?.planTier)) ===
    "premium";
  const [items, setItems] = useState<Transaction[]>([]);
  const [investmentPositions, setInvestmentPositions] = useState<
    InvestmentPosition[]
  >([]);
  const [debtTotals, setDebtTotals] = useState<{
    receivable: number;
    payable: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);

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
      setRecurringRules([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch, planPremium]);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const stats = useMemo(() => {
    const totalIncome = sumByType(items, "income");
    const totalExpense = sumByType(items, "expense");
    const net = totalIncome - totalExpense;
    const thisMonthExpense = sumExpenseInRange(items, monthStart, monthEnd);
    const bars = lastNMonthsBars(items, 6, now);
    const pie = expenseByCategoryForMonth(items, now);
    const recent = [...items]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    return {
      totalIncome,
      totalExpense,
      net,
      thisMonthExpense,
      bars,
      pie,
      recent,
    };
  }, [items, monthStart, monthEnd, now]);

  const investmentPnl = useMemo(
    () => totalInvestmentPnlTry(investmentPositions),
    [investmentPositions],
  );

  const stockSummary = useMemo(
    () => aggregatePositionsTry(investmentPositions, "STOCK"),
    [investmentPositions],
  );

  const goldSummary = useMemo(
    () => aggregatePositionsTry(investmentPositions, "GOLD"),
    [investmentPositions],
  );

  const upcomingRecurring = useMemo(() => {
    return [...recurringRules]
      .filter((r) => r.isActive)
      .sort(
        (a, b) =>
          new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime(),
      )
      .slice(0, 5);
  }, [recurringRules]);

  const activeRecurringCount = useMemo(
    () => recurringRules.filter((r) => r.isActive).length,
    [recurringRules],
  );

  if (loading) {
    return <DashboardPageSkeleton />;
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
        thisMonthExpense={stats.thisMonthExpense}
        investmentPnl={planPremium ? investmentPnl : undefined}
      />

      {debtTotals !== null && (
        <DashboardDebtCard
          receivable={debtTotals.receivable}
          payable={debtTotals.payable}
          currency={currency}
        />
      )}

      <DashboardChartsSection bars={stats.bars} pie={stats.pie} />

      <DashboardRecurringCard
        activeRecurringCount={activeRecurringCount}
        upcomingRecurring={upcomingRecurring}
        currency={currency}
      />

      <DashboardInvestmentSection
        planPremium={planPremium}
        currency={currency}
        stockSummary={stockSummary}
        goldSummary={goldSummary}
      />

      <DashboardRecentTransactionsCard
        transactions={stats.recent}
        currency={currency}
      />
    </div>
  );
}
