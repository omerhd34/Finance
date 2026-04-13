/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  Coins,
  LineChart,
  Receipt,
  Scale,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  aggregatePositionsTry,
  totalInvestmentPnlTry,
} from "@/lib/investment-position-math";
import type { Debt } from "@/types/debt";
import type { InvestmentPosition } from "@/types/investment";
import type { RecurringRule } from "@/types/recurring";
import type { Transaction } from "@/types/transaction";
import { apiClient } from "@/lib/api-client";
import {
  expenseByCategoryForMonth,
  lastNMonthsBars,
  percentChange,
  sumByType,
  sumExpenseInRange,
} from "@/lib/dashboard-stats";
import {
  cn,
  currencySymbolLabel,
  formatMoneyAmount,
  formatDateShort,
} from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { processDueRecurring } from "@/store/slices/recurringSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthlyBarChart } from "@/components/charts/monthly-bar-chart";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { QuickTransactionDialog } from "@/components/dashboard/quick-transaction-dialog";

const RECURRING_FREQUENCY_LABEL: Record<string, string> = {
  WEEKLY: "Haftalık",
  MONTHLY: "Aylık",
  YEARLY: "Yıllık",
};

const RECURRING_MODE_LABEL: Record<string, string> = {
  AUTO: "Otomatik kayıt",
  REMINDER: "Hatırlatıcı",
};

function DashboardKpiCard({
  icon: Icon,
  iconClassName,
  glowClassName,
  label,
  value,
  valueClassName,
  footer,
  headerRight,
}: {
  icon: LucideIcon;
  iconClassName: string;
  glowClassName: string;
  label: ReactNode;
  value: ReactNode;
  valueClassName?: string;
  footer?: ReactNode;
  headerRight?: ReactNode;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/50",
        "bg-linear-to-br from-card via-card to-muted/30",
        "shadow-sm ring-1 ring-black/5 transition-all duration-200 dark:ring-white/10",
        "hover:border-border hover:shadow-md",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-80 blur-3xl",
          glowClassName,
        )}
      />
      <CardHeader className="relative space-y-0 p-5 pb-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1",
              iconClassName,
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <CardDescription className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </CardDescription>
              {headerRight}
            </div>
            <CardTitle
              className={cn(
                "text-2xl font-semibold tracking-tight tabular-nums sm:text-[1.625rem]",
                valueClassName,
              )}
            >
              {value}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      {footer ? (
        <CardContent className="relative border-t border-border/50 bg-muted/20 px-5 pb-4 pt-3 text-[11px] leading-relaxed text-muted-foreground">
          {footer}
        </CardContent>
      ) : null}
    </Card>
  );
}

function debtRemaining(d: Debt): number {
  return Math.max(0, d.totalAmount - d.paidAmount);
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
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
      } catch {
      }
      const [txRes, debtRes, invRes, recRes] = await Promise.all([
        apiClient.get<{ items: Transaction[] }>("/api/transactions?limit=2000"),
        apiClient.get<{ items: Debt[] }>("/api/debts"),
        apiClient.get<{ items: InvestmentPosition[] }>("/api/investments"),
        apiClient.get<{ items: RecurringRule[] }>("/api/recurring"),
      ]);
      setItems(txRes.data.items);
      setInvestmentPositions(invRes.data.items);
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
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));

  const stats = useMemo(() => {
    const totalIncome = sumByType(items, "income");
    const totalExpense = sumByType(items, "expense");
    const net = totalIncome - totalExpense;
    const thisMonthExpense = sumExpenseInRange(items, monthStart, monthEnd);
    const prevMonthExpense = sumExpenseInRange(
      items,
      prevMonthStart,
      prevMonthEnd,
    );
    const pct = percentChange(thisMonthExpense, prevMonthExpense);
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
      prevMonthExpense,
      pct,
      bars,
      pie,
      recent,
    };
  }, [items, monthStart, monthEnd, prevMonthStart, prevMonthEnd, now]);

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
          new Date(a.nextDueDate).getTime() -
          new Date(b.nextDueDate).getTime(),
      )
      .slice(0, 5);
  }, [recurringRules]);

  const activeRecurringCount = useMemo(
    () => recurringRules.filter((r) => r.isActive).length,
    [recurringRules],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[320px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
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

  const spendUp = stats.pct > 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <QuickTransactionDialog onSaved={load} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <DashboardKpiCard
          icon={Wallet}
          iconClassName="bg-emerald-500/15 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400"
          glowClassName="bg-emerald-500/25"
          label={`Toplam Gelir (${currencySymbolLabel(currency)})`}
          value={formatMoneyAmount(stats.totalIncome, currency)}
          valueClassName="text-emerald-600 dark:text-emerald-400"
        />
        <DashboardKpiCard
          icon={Receipt}
          iconClassName="bg-rose-500/15 text-rose-600 ring-rose-500/25 dark:text-rose-400"
          glowClassName="bg-rose-500/20"
          label={`Toplam Gider (${currencySymbolLabel(currency)})`}
          value={formatMoneyAmount(stats.totalExpense, currency)}
          valueClassName="text-rose-600 dark:text-rose-400"
        />
        <DashboardKpiCard
          icon={Scale}
          iconClassName="bg-sky-500/15 text-sky-700 ring-sky-500/25 dark:text-sky-300"
          glowClassName="bg-sky-500/15"
          label={`Net Bakiye (${currencySymbolLabel(currency)})`}
          value={formatMoneyAmount(stats.net, currency)}
          valueClassName="text-foreground"
          footer="Gelir − gider (işlemler)"
        />
        <DashboardKpiCard
          icon={LineChart}
          iconClassName="bg-violet-500/15 text-violet-700 ring-violet-500/25 dark:text-violet-300"
          glowClassName="bg-violet-500/20"
          label={`Yatırım K/Z (${currencySymbolLabel(currency)})`}
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
          footer={
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span>Pozisyon değeri − maliyet (tahmini).</span>
              <Link
                href="/investments"
                className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-500/20 transition-colors hover:bg-emerald-500/18 dark:text-emerald-300"
              >
                Yatırımlar
                <ArrowUpRight className="h-3.5 w-3.5 opacity-80" aria-hidden />
              </Link>
            </div>
          }
        />
        <DashboardKpiCard
          icon={CalendarDays}
          iconClassName="bg-amber-500/15 text-amber-800 ring-amber-500/25 dark:text-amber-300"
          glowClassName="bg-amber-500/15"
          label={`Bu Ay Harcama (${currencySymbolLabel(currency)})`}
          value={formatMoneyAmount(stats.thisMonthExpense, currency)}
          valueClassName="text-foreground"
          headerRight={
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ring-1",
                spendUp
                  ? "bg-rose-500/15 text-rose-700 ring-rose-500/25 dark:text-rose-300"
                  : "bg-emerald-500/15 text-emerald-800 ring-emerald-500/25 dark:text-emerald-300",
              )}
            >
              {spendUp ? (
                <TrendingUp className="h-3 w-3" aria-hidden />
              ) : (
                <TrendingDown className="h-3 w-3" aria-hidden />
              )}
              {stats.prevMonthExpense === 0 && stats.thisMonthExpense === 0
                ? "—"
                : `${spendUp ? "+" : ""}${stats.pct.toLocaleString("tr-TR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}%`}
            </span>
          }
          footer={`Önceki ay: ${formatMoneyAmount(stats.prevMonthExpense, currency)}`}
        />
      </div>

      {debtTotals !== null && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Borç &amp; Alacak Özeti</CardTitle>
              <CardDescription>
                Yapılan ödemeler düşülmüş güncel kalan bakiyeler
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/debts">Detaylar</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 select-none">
            <div className="pointer-events-none outline-none">
              <p className="text-sm text-muted-foreground">
                Toplam alacak ({currencySymbolLabel(currency)})
              </p>
              <p className="text-xl font-semibold text-emerald-500">
                {formatMoneyAmount(debtTotals.receivable, currency)}
              </p>
            </div>
            <div className="pointer-events-none outline-none">
              <p className="text-sm text-muted-foreground">
                Toplam borç ({currencySymbolLabel(currency)})
              </p>
              <p className="text-xl font-semibold text-amber-500">
                {formatMoneyAmount(debtTotals.payable, currency)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gelir ve Gider</CardTitle>
            <CardDescription>
              Son 6 aylık toplam gelir ve gider grafiği
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyBarChart data={stats.bars} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="-mb-10">
            <CardTitle>Son Ay Kategori Giderleri</CardTitle>
            <CardDescription>Harcama dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={stats.pie} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock
                className="h-5 w-5 text-muted-foreground"
                aria-hidden
              />
              Tekrarlayan işlemler
            </CardTitle>
            <CardDescription>
              {activeRecurringCount === 0
                ? "Aktif tekrarlayan kural yok"
                : `${activeRecurringCount} aktif kural · Yaklaşan vadeler`}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/recurring">Tümünü gör</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {upcomingRecurring.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Henüz tekrarlayan kural yok veya tüm kurallar pasif.{" "}
              <Link
                href="/recurring"
                className="text-primary underline-offset-4 hover:underline"
              >
                Kural ekleyin
              </Link>
            </p>
          ) : (
            <ul className="space-y-4">
              {upcomingRecurring.map((rule) => (
                <li
                  key={rule.id}
                  className="flex flex-col gap-2 border-b border-border/60 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium leading-tight">{rule.category}</p>
                    {rule.description ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {rule.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end sm:self-center">
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge variant="outline" className="text-[10px]">
                        {RECURRING_MODE_LABEL[rule.mode] ?? rule.mode}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {RECURRING_FREQUENCY_LABEL[rule.frequency] ??
                          rule.frequency}
                      </Badge>
                      <Badge
                        variant={
                          rule.type === "income" ? "income" : "expense"
                        }
                      >
                        {rule.type === "income" ? "Gelir" : "Gider"}
                      </Badge>
                      <span className="text-sm font-semibold tabular-nums">
                        {formatMoneyAmount(rule.amount, currency)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground sm:text-right">
                      Sonraki: {formatDateShort(rule.nextDueDate)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LineChart
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden
                />
                Hisse Senedi ({currencySymbolLabel(currency)})
              </CardTitle>
              <CardDescription>
                Kayıtlı hisse pozisyonlarınızın toplam maliyet, güncel değer ve
                tahmini K/Z özeti
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/investments">Yatırımlar</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stockSummary.count === 0 ? (
              <p className="text-sm text-muted-foreground">
                Henüz hisse pozisyonu yok.{" "}
                <Link
                  href="/investments"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Pozisyon ekleyin
                </Link>
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pozisyon</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {stockSummary.count}{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      adet
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Toplam maliyet
                  </p>
                  <p className="text-xl font-semibold tabular-nums">
                    {formatMoneyAmount(stockSummary.costTry, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Güncel değer</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {formatMoneyAmount(stockSummary.valueTry, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">K/Z</p>
                  <p
                    className={`text-xl font-semibold tabular-nums ${
                      stockSummary.pnlTry > 0
                        ? "text-emerald-500"
                        : stockSummary.pnlTry < 0
                          ? "text-red-500"
                          : ""
                    }`}
                  >
                    {stockSummary.pnlTry > 0 ? "+" : ""}
                    {formatMoneyAmount(stockSummary.pnlTry, currency)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coins className="h-5 w-5 text-muted-foreground" aria-hidden />
                Altın ({currencySymbolLabel(currency)})
              </CardTitle>
              <CardDescription>
                Kayıtlı altın pozisyonlarınızın toplam maliyet, güncel değer ve
                tahmini K/Z özeti
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/investments">Yatırımlar</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {goldSummary.count === 0 ? (
              <p className="text-sm text-muted-foreground">
                Henüz altın pozisyonu yok.{" "}
                <Link
                  href="/investments"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Pozisyon ekleyin
                </Link>
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pozisyon</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {goldSummary.count}{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      adet
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Toplam maliyet
                  </p>
                  <p className="text-xl font-semibold tabular-nums">
                    {formatMoneyAmount(goldSummary.costTry, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Güncel değer</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {formatMoneyAmount(goldSummary.valueTry, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">K/Z</p>
                  <p
                    className={`text-xl font-semibold tabular-nums ${
                      goldSummary.pnlTry > 0
                        ? "text-emerald-500"
                        : goldSummary.pnlTry < 0
                          ? "text-red-500"
                          : ""
                    }`}
                  >
                    {goldSummary.pnlTry > 0 ? "+" : ""}
                    {formatMoneyAmount(goldSummary.pnlTry, currency)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Son işlemler</CardTitle>
            <CardDescription>En son 5 hareket</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/transactions">Tümünü gör</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead className="text-right">
                  Tutar ({currencySymbolLabel(currency)})
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recent.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Henüz işlem yok.
                  </TableCell>
                </TableRow>
              ) : (
                stats.recent.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{formatDateShort(t.date)}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {t.description ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={t.type === "income" ? "income" : "expense"}
                      >
                        {t.type === "income" ? "Gelir" : "Gider"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {t.type === "income" ? (
                        <span className="inline-flex items-center text-emerald-500">
                          <ArrowUpRight className="mr-1 h-4 w-4" />
                          {formatMoneyAmount(t.amount, currency)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-500">
                          <ArrowDownRight className="mr-1 h-4 w-4" />
                          {formatMoneyAmount(t.amount, currency)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
