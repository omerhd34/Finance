/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  LineChart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  aggregatePositionsTry,
  totalInvestmentPnlTry,
} from "@/lib/investment-position-math";
import type { Debt } from "@/types/debt";
import type { InvestmentPosition } from "@/types/investment";
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
  currencySymbolLabel,
  formatMoneyAmount,
  formatDateShort,
} from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
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

function debtRemaining(d: Debt): number {
  return Math.max(0, d.totalAmount - d.paidAmount);
}

export default function DashboardPage() {
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [txRes, debtRes, invRes] = await Promise.all([
        apiClient.get<{ items: Transaction[] }>("/api/transactions?limit=2000"),
        apiClient.get<{ items: Debt[] }>("/api/debts"),
        apiClient.get<{ items: InvestmentPosition[] }>("/api/investments"),
      ]);
      setItems(txRes.data.items);
      setInvestmentPositions(invRes.data.items);
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
    } finally {
      setLoading(false);
    }
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[320px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Hoş geldiniz. Finans özetiniz aşağıda.
        </p>
        <QuickTransactionDialog onSaved={load} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Toplam Gelir ({currencySymbolLabel(currency)})
            </CardDescription>
            <CardTitle className="text-2xl text-emerald-500">
              {formatMoneyAmount(stats.totalIncome, currency)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Toplam Gider ({currencySymbolLabel(currency)})
            </CardDescription>
            <CardTitle className="text-2xl text-red-500">
              {formatMoneyAmount(stats.totalExpense, currency)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Net Bakiye ({currencySymbolLabel(currency)})
            </CardDescription>
            <CardTitle className="text-2xl">
              {formatMoneyAmount(stats.net, currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Gelir − gider (işlemler)
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Yatırım K/Z ({currencySymbolLabel(currency)})
            </CardDescription>
            <CardTitle
              className={`text-2xl tabular-nums ${
                investmentPnl > 0
                  ? "text-emerald-500"
                  : investmentPnl < 0
                    ? "text-red-500"
                    : ""
              }`}
            >
              {investmentPnl > 0 ? "+" : ""}
              {formatMoneyAmount(investmentPnl, currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Pozisyon değeri − maliyet (tahmini).{" "}
            <Link
              href="/investments"
              className="text-primary underline-offset-4 hover:underline"
            >
              Yatırımlar
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between gap-2">
              <span>Bu Ay Harcama ({currencySymbolLabel(currency)})</span>
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                  spendUp ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {spendUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stats.prevMonthExpense === 0 && stats.thisMonthExpense === 0
                  ? "—"
                  : `${spendUp ? "+" : ""}${stats.pct.toLocaleString("tr-TR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}%`}
              </span>
            </CardDescription>
            <CardTitle className="text-2xl">
              {formatMoneyAmount(stats.thisMonthExpense, currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Önceki ay: {formatMoneyAmount(stats.prevMonthExpense, currency)}
          </CardContent>
        </Card>
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
