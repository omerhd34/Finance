import { LineChart, PieChart } from "lucide-react";
import { MonthlyBarChart } from "@/components/charts/monthly-bar-chart";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
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
};

export function DashboardChartsSection({ bars, pie }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart
              className="h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            Gelir ve Gider
          </CardTitle>
          <CardDescription>
            Son 6 ayın aylık gelir ve gider trendi (çizgi grafik)
          </CardDescription>
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
            Son Ay Kategori Giderleri
          </CardTitle>
          <CardDescription>Harcama dağılımı</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryPieChart data={pie} />
        </CardContent>
      </Card>
    </div>
  );
}
