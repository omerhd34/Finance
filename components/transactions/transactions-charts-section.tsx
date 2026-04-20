import { LineChart, PieChart } from "lucide-react";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { MonthlyBarChart } from "@/components/charts/monthly-bar-chart";
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
  loading?: boolean;
};

export function TransactionsChartsSection({
  bars,
  pie,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Son 3 ay — Gelir ve Gider</CardTitle>
            <CardDescription>Yükleniyor…</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full animate-pulse rounded-lg bg-muted/25" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Son 3 ay — Kategori Giderleri</CardTitle>
            <CardDescription>Yükleniyor…</CardDescription>
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
          <CardTitle className="flex items-center gap-2">
            <LineChart
              className="h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            Son 3 ay — Gelir ve Gider
          </CardTitle>
          <CardDescription>Üç ayın aylık gelir ve gider trendi</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyBarChart data={bars} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="-mb-10">
          <CardTitle className="flex items-center gap-2">
            <PieChart
              className="h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            Son 3 ay — Kategori Giderleri
          </CardTitle>
          <CardDescription>
            Üç ayın giderlerinin kategori bazında toplam dağılımı
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryPieChart data={pie} />
        </CardContent>
      </Card>
    </div>
  );
}
