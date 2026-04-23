import { HandCoins, LineChart, Receipt, Scale, Wallet } from "lucide-react";
import { DashboardKpiCard } from "@/components/dashboard/dashboard-kpi-card";
import { currencySymbolLabel, formatMoneyAmount } from "@/lib/utils";

type Props = {
  currency: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
  debtNetBalance?: number;
  investmentPnl?: number;
};

export function DashboardKpiSection({
  currency,
  totalIncome,
  totalExpense,
  net,
  debtNetBalance,
  investmentPnl,
}: Props) {
  const showInvestmentKpi = investmentPnl !== undefined;
  const showDebtNetKpi = debtNetBalance !== undefined;
  return (
    <div
      className={
        showInvestmentKpi || showDebtNetKpi
          ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5"
          : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      <DashboardKpiCard
        icon={Wallet}
        iconClassName="bg-emerald-500/15 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400"
        glowClassName="bg-emerald-500/25"
        label={`Toplam Gelir (${currencySymbolLabel(currency)})`}
        value={formatMoneyAmount(totalIncome, currency)}
        valueClassName="text-emerald-600 dark:text-emerald-400"
      />
      <DashboardKpiCard
        icon={Receipt}
        iconClassName="bg-rose-500/15 text-rose-600 ring-rose-500/25 dark:text-rose-400"
        glowClassName="bg-rose-500/20"
        label={`Toplam Gider (${currencySymbolLabel(currency)})`}
        value={formatMoneyAmount(totalExpense, currency)}
        valueClassName="text-rose-600 dark:text-rose-400"
      />
      <DashboardKpiCard
        icon={Scale}
        iconClassName="bg-sky-500/15 text-sky-700 ring-sky-500/25 dark:text-sky-300"
        glowClassName="bg-sky-500/15"
        label={`Net Bakiye (${currencySymbolLabel(currency)})`}
        value={formatMoneyAmount(net, currency)}
        valueClassName="text-foreground"
      />
      {showDebtNetKpi ? (
        <DashboardKpiCard
          icon={HandCoins}
          iconClassName="bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300"
          glowClassName="bg-amber-500/20"
          label={`Borç/Alacak Neti (${currencySymbolLabel(currency)})`}
          value={
            <>
              {debtNetBalance > 0 ? "+" : ""}
              {formatMoneyAmount(debtNetBalance, currency)}
            </>
          }
          valueClassName={
            debtNetBalance > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : debtNetBalance < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-foreground"
          }
        />
      ) : null}
      {showInvestmentKpi ? (
        <DashboardKpiCard
          icon={LineChart}
          iconClassName="bg-violet-500/15 text-violet-700 ring-violet-500/25 dark:text-violet-300"
          glowClassName="bg-violet-500/20"
          label={`Yatırım Kar/Zarar (${currencySymbolLabel(currency)})`}
          value={
            <>
              {investmentPnl > 0 ? "+" : ""}
              {formatMoneyAmount(investmentPnl, currency)}
            </>
          }
          valueClassName={
            investmentPnl > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : investmentPnl < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-foreground"
          }
        />
      ) : null}
    </div>
  );
}
