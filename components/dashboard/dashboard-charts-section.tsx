import { LineChart, PieChart } from "lucide-react";
import { MonthlyBarChart } from "@/components/charts/monthly-bar-chart";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import type {
  CategorySlice,
  MonthlyBarRow,
} from "@/lib/dashboard/dashboard-stats";

type Props = {
  bars: MonthlyBarRow[];
  pie: CategorySlice[];
  barsMonths: number;
  pieMonths: number;
  barsRangeLabel: string;
  pieRangeLabel: string;
  onBarsMonthsChange: (months: number) => void;
  onPieMonthsChange: (months: number) => void;
};

export function DashboardChartsSection({
  bars,
  pie,
  barsMonths,
  pieMonths,
  barsRangeLabel,
  pieRangeLabel,
  onBarsMonthsChange,
  onPieMonthsChange,
}: Props) {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-2">
      <Card className="min-w-0">
        <DashboardSectionHeader
          icon={LineChart}
          title="Gelir, Gider ve Tasarruf Oranı"
          description={`${barsRangeLabel} döneminin aylık gelir-gider trendi ve tasarruf oranı`}
          action={
            <div className="w-full shrink-0 sm:max-w-[200px] sm:ml-auto">
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
                  <SelectItem value="12">Son yıl</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
        <div className="p-4 sm:p-6">
          <MonthlyBarChart data={bars} />
        </div>
      </Card>
      <Card className="min-w-0 overflow-hidden">
        <DashboardSectionHeader
          icon={PieChart}
          title="Kategori Giderleri"
          description={`${pieRangeLabel} döneminde giderlerin kategori bazında toplam dağılımı`}
          action={
            <div className="w-full shrink-0 sm:max-w-[200px] sm:ml-auto">
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
                  <SelectItem value="12">Son yıl</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
        <div className="p-4 sm:p-6">
          <CategoryPieChart data={pie} />
        </div>
      </Card>
    </div>
  );
}
