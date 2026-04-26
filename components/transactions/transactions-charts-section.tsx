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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CategorySlice, MonthlyBarRow } from "@/lib/dashboard-stats";

type Props = {
  bars: MonthlyBarRow[];
  pie: CategorySlice[];
  barsMonths: number;
  pieMonths: number;
  onBarsMonthsChange: (months: number) => void;
  onPieMonthsChange: (months: number) => void;
  loading?: boolean;
};

export function TransactionsChartsSection({
  bars,
  pie,
  barsMonths,
  pieMonths,
  onBarsMonthsChange,
  onPieMonthsChange,
  loading = false,
}: Props) {
  const barsPeriodTitle = `Son ${barsMonths} ay`;
  const piePeriodTitle = `Son ${pieMonths} ay`;
  const monthlyTrendDescription = `${barsMonths} ayın aylık gelir-gider trendi ve tasarruf oranı (%)`;
  const categoryDescription = `${pieMonths} ayın giderlerinin kategori bazında toplam dağılımı`;

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>
                  {barsPeriodTitle} — Gelir, Gider ve Tasarruf Oranı
                </CardTitle>
                <CardDescription>Yükleniyor…</CardDescription>
              </div>
              <div className="w-full max-w-[200px] space-y-1.5 sm:ml-auto sm:-mt-1">
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
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full animate-pulse rounded-lg bg-muted/25" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>{piePeriodTitle} — Kategori Giderleri</CardTitle>
                <CardDescription>Yükleniyor…</CardDescription>
              </div>
              <div className="w-full max-w-[200px] space-y-1.5 sm:ml-auto sm:-mt-1">
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
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full animate-pulse rounded-lg bg-muted/25" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <LineChart
                  className="h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                {barsPeriodTitle} — Gelir ve Gider
              </CardTitle>
              <CardDescription>{monthlyTrendDescription}</CardDescription>
            </div>
            <div className="w-full max-w-[200px] space-y-1.5 sm:ml-auto sm:-mt-1">
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
        </CardHeader>
        <CardContent>
          <MonthlyBarChart data={bars} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <PieChart
                  className="h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                {piePeriodTitle} — Kategori Giderleri
              </CardTitle>
              <CardDescription>{categoryDescription}</CardDescription>
            </div>
            <div className="w-full max-w-[200px] space-y-1.5 sm:ml-auto sm:-mt-1">
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
        </CardHeader>
        <CardContent>
          <CategoryPieChart data={pie} />
        </CardContent>
      </Card>
    </div>
  );
}
