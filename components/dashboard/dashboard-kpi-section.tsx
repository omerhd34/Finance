import {
  Activity,
  Coins,
  HandCoins,
  LineChart,
  Receipt,
  Scale,
  Wallet,
} from "lucide-react";
import { DashboardKpiCard } from "@/components/dashboard/dashboard-kpi-card";
import { formatMoneyAmount } from "@/lib/common/utils";
import type { FinancialHealthScore } from "@/lib/dashboard/financial-health-score";

type Props = {
  currency: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
  debtNetBalance?: number;
  investmentPnl?: number;
  financialHealth?: FinancialHealthScore;
};

export function DashboardKpiSection({
  currency,
  totalIncome,
  totalExpense,
  net,
  debtNetBalance,
  investmentPnl,
  financialHealth,
}: Props) {
  const showInvestmentKpi = investmentPnl !== undefined;
  const showDebtNetKpi = debtNetBalance !== undefined;
  const showFinancialHealth = financialHealth !== undefined;

  const debtPart = debtNetBalance ?? 0;
  const investmentPart = investmentPnl ?? 0;
  const fullBalance = net + debtPart + investmentPart;

  const cardCount =
    4 +
    (showDebtNetKpi ? 1 : 0) +
    (showInvestmentKpi ? 1 : 0) +
    (showFinancialHealth ? 1 : 0);

  const gridClassName =
    cardCount === 4
      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4"
      : "grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={gridClassName}>
      <DashboardKpiCard
        icon={Wallet}
        iconClassName="bg-emerald-500/15 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400"
        glowClassName="bg-emerald-500/25"
        label="Son Ay Toplam Gelir"
        value={formatMoneyAmount(totalIncome, currency)}
        valueClassName="text-emerald-600 dark:text-emerald-400"
      />
      <DashboardKpiCard
        icon={Receipt}
        iconClassName="bg-rose-500/15 text-rose-600 ring-rose-500/25 dark:text-rose-400"
        glowClassName="bg-rose-500/20"
        label="Son Ay Toplam Gider"
        value={formatMoneyAmount(totalExpense, currency)}
        valueClassName="text-rose-600 dark:text-rose-400"
      />
      {showFinancialHealth ? (
        <DashboardKpiCard
          icon={Activity}
          iconClassName="bg-lime-500/15 text-lime-700 ring-lime-500/30 dark:text-lime-300"
          glowClassName="bg-lime-500/25"
          label="Son Ay Finansal Sağlık Skoru"
          value={
            <div className="space-y-0.5">
              <div>{financialHealth.score}</div>
              {financialHealth.insight ? (
                <p className="text-xs font-medium text-muted-foreground">
                  {financialHealth.insight}
                </p>
              ) : null}
            </div>
          }
          valueClassName={
            financialHealth.insight === ""
              ? "text-foreground"
              : financialHealth.level === "cok-iyi"
                ? "text-emerald-600 dark:text-emerald-400"
                : financialHealth.level === "iyi"
                  ? "text-sky-600 dark:text-sky-400"
                  : financialHealth.level === "gelisiyor"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
          }
        />
      ) : null}
      <DashboardKpiCard
        icon={Scale}
        iconClassName="bg-sky-500/15 text-sky-700 ring-sky-500/25 dark:text-sky-300"
        glowClassName="bg-sky-500/15"
        label="Net Bakiye"
        value={formatMoneyAmount(net, currency)}
        valueClassName="text-foreground"
      />
      {showInvestmentKpi ? (
        <DashboardKpiCard
          icon={LineChart}
          iconClassName="bg-violet-500/15 text-violet-700 ring-violet-500/25 dark:text-violet-300"
          glowClassName="bg-violet-500/20"
          label="Yatırım Kar/Zarar"
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
      {showDebtNetKpi ? (
        <DashboardKpiCard
          icon={HandCoins}
          iconClassName="bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300"
          glowClassName="bg-amber-500/20"
          label="Borç/Alacak Neti"
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
      <DashboardKpiCard
        icon={Coins}
        iconClassName="bg-teal-500/15 text-teal-700 ring-teal-500/25 dark:text-teal-300"
        glowClassName="bg-teal-500/15"
        label="Tam Bakiye"
        value={
          <div className="space-y-0.5">
            <div>
              {fullBalance > 0 ? "+" : ""}
              {formatMoneyAmount(fullBalance, currency)}
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              Net bakiye + borç/alacak + yatırım (Premium).
            </p>
          </div>
        }
        valueClassName={
          fullBalance > 0
            ? "text-emerald-600 dark:text-emerald-400"
            : fullBalance < 0
              ? "text-rose-600 dark:text-rose-400"
              : "text-foreground"
        }
        className={
          cardCount === 7
            ? "sm:col-span-2 lg:col-span-2 xl:col-span-3"
            : undefined
        }
      />
    </div>
  );
}
