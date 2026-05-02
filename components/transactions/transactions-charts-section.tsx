import type { ReactNode } from "react";
import { LineChart, PieChart } from "lucide-react";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { MonthlyBarChart } from "@/components/charts/monthly-bar-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import type { CategorySlice, MonthlyBarRow } from "@/lib/dashboard/dashboard-stats";

type Props = {
  bars: MonthlyBarRow[];
  pie: CategorySlice[];
  barsMonths: number;
  pieMonths: number;
  barsRangeLabel: string;
  pieRangeLabel: string;
  onBarsMonthsChange: (months: number) => void;
  onPieMonthsChange: (months: number) => void;
  loading?: boolean;
};

function chartHeaderIconBox(children: ReactNode) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15"
      aria-hidden
    >
      {children}
    </div>
  );
}

export function TransactionsChartsSection({
  bars,
  pie,
  barsMonths,
  pieMonths,
  barsRangeLabel,
  pieRangeLabel,
  onBarsMonthsChange,
  onPieMonthsChange,
  loading = false,
}: Props) {
  const barsPeriodTitle = `Son ${barsMonths} ay`;
  const piePeriodTitle = `Son ${pieMonths} ay`;
  const monthlyTrendDescription = `${barsRangeLabel} döneminin aylık gelir-gider trendi ve tasarruf oranı (%)`;
  const categoryDescription = `${pieRangeLabel} döneminde giderlerin kategori bazında toplam dağılımı`;

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-border bg-muted/30 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6 sm:py-6">
            <div className="flex min-w-0 gap-3.5">
              {chartHeaderIconBox(<LineChart className="h-5 w-5" />)}
              <div className="min-w-0 space-y-1.5 pt-0.5">
                <h3 className="text-lg font-semibold leading-tight tracking-tight">
                  {barsPeriodTitle} — Gelir ve Gider
                </h3>
                <p className="text-sm leading-snug text-muted-foreground">
                  Yükleniyor…
                </p>
              </div>
            </div>
            <div className="w-full max-w-[200px] shrink-0 sm:ml-auto">
              <Select
                value={String(barsMonths)}
                onValueChange={(v) => onBarsMonthsChange(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">Son 2 ay</SelectItem>
                  <SelectItem value="3">Son 3 ay</SelectItem>
                  <SelectItem value="6">Son 6 ay</SelectItem>
                  <SelectItem value="9">Son 9 ay</SelectItem>
                  <SelectItem value="12">Son 12 ay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-[300px] w-full animate-pulse rounded-lg bg-muted/25" />
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-border bg-muted/30 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6 sm:py-6">
            <div className="flex min-w-0 gap-3.5">
              {chartHeaderIconBox(<PieChart className="h-5 w-5" />)}
              <div className="min-w-0 space-y-1.5 pt-0.5">
                <h3 className="text-lg font-semibold leading-tight tracking-tight">
                  {piePeriodTitle} — Kategori Giderleri
                </h3>
                <p className="text-sm leading-snug text-muted-foreground">
                  Yükleniyor…
                </p>
              </div>
            </div>
            <div className="w-full max-w-[200px] shrink-0 sm:ml-auto">
              <Select
                value={String(pieMonths)}
                onValueChange={(v) => onPieMonthsChange(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Son 1 ay</SelectItem>
                  <SelectItem value="2">Son 2 ay</SelectItem>
                  <SelectItem value="3">Son 3 ay</SelectItem>
                  <SelectItem value="6">Son 6 ay</SelectItem>
                  <SelectItem value="9">Son 9 ay</SelectItem>
                  <SelectItem value="12">Son 12 ay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-[300px] w-full animate-pulse rounded-lg bg-muted/25" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border bg-muted/30 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6 sm:py-6">
          <div className="flex min-w-0 gap-3.5">
            {chartHeaderIconBox(<LineChart className="h-5 w-5" />)}
            <div className="min-w-0 space-y-1.5 pt-0.5">
              <h3 className="text-lg font-semibold leading-tight tracking-tight">
                {barsPeriodTitle} — Gelir ve Gider
              </h3>
              <p className="text-sm leading-snug text-muted-foreground">
                {monthlyTrendDescription}
              </p>
            </div>
          </div>
          <div className="w-full max-w-[200px] shrink-0 sm:ml-auto">
            <Select
              value={String(barsMonths)}
              onValueChange={(v) => onBarsMonthsChange(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Son 2 ay</SelectItem>
                <SelectItem value="3">Son 3 ay</SelectItem>
                <SelectItem value="6">Son 6 ay</SelectItem>
                <SelectItem value="9">Son 9 ay</SelectItem>
                <SelectItem value="12">Son 12 ay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <MonthlyBarChart data={bars} />
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border bg-muted/30 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6 sm:py-6">
          <div className="flex min-w-0 gap-3.5">
            {chartHeaderIconBox(<PieChart className="h-5 w-5" />)}
            <div className="min-w-0 space-y-1.5 pt-0.5">
              <h3 className="text-lg font-semibold leading-tight tracking-tight">
                {piePeriodTitle} — Kategori Giderleri
              </h3>
              <p className="text-sm leading-snug text-muted-foreground">
                {categoryDescription}
              </p>
            </div>
          </div>
          <div className="w-full max-w-[200px] shrink-0 sm:ml-auto">
            <Select
              value={String(pieMonths)}
              onValueChange={(v) => onPieMonthsChange(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Son 1 ay</SelectItem>
                <SelectItem value="2">Son 2 ay</SelectItem>
                <SelectItem value="3">Son 3 ay</SelectItem>
                <SelectItem value="6">Son 6 ay</SelectItem>
                <SelectItem value="9">Son 9 ay</SelectItem>
                <SelectItem value="12">Son 12 ay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <CategoryPieChart data={pie} />
        </div>
      </Card>
    </div>
  );
}
