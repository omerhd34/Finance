"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn, formatMoney } from "@/lib/common/utils";
import type { PortfolioLegendEntry, PortfolioPieDatum } from "@/lib/investments/portfolio-charts-shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieSliceLabel } from "./pie-slice-label";

type Props = {
  pieData: PortfolioPieDatum[];
  pieTotal: number;
  portfolioLegendEntries: PortfolioLegendEntry[];
  currency: string;
};

export function PortfolioPieCard({
  pieData,
  pieTotal,
  portfolioLegendEntries,
  currency,
}: Props) {
  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Portföy dağılımı</CardTitle>
        <CardDescription>
          Güncel değere göre varlık türü oranları
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        {pieData.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 py-8">
            <p className="text-center text-sm text-muted-foreground">
              Güncel değeri sıfırdan büyük kategori yok; pasta grafik boş.
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Aşağıda tüm türler ₺0,00 olarak listelenir.
            </p>
          </div>
        ) : (
          <div
            className="relative h-[320px] w-full md:h-[360px] outline-none **:outline-none **:focus-visible:outline-none [&_svg]:outline-none"
            onMouseDownCapture={(e) => e.preventDefault()}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart
                className="[&_.recharts-surface]:outline-none [&_.recharts-surface:focus]:outline-none [&_.recharts-sector:focus]:outline-none [&_svg]:outline-none"
                tabIndex={-1}
              >
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="42%"
                  outerRadius="88%"
                  paddingAngle={2}
                  stroke="hsl(var(--border))"
                  strokeWidth={2}
                  label={PieSliceLabel}
                  labelLine={false}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={`p-${i}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0];
                    return (
                      <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                        <p className="font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="tabular-nums text-muted-foreground">
                          {formatMoney(Number(item.value ?? 0), currency)}
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-tighter text-muted-foreground">
                  Toplam değer
                </p>
                <p className="text-sm font-bold tabular-nums">
                  {formatMoney(pieTotal, currency)}
                </p>
              </div>
            </div>
          </div>
        )}
        <ul
          className={cn(
            "mt-4 gap-y-5 border-t border-border/40 pt-4",
            portfolioLegendEntries.length === 6
              ? "grid grid-cols-3 justify-items-center gap-x-4 sm:gap-x-6"
              : "flex flex-wrap justify-center gap-x-8",
          )}
        >
          {portfolioLegendEntries.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex flex-col items-center gap-1 px-2 text-center",
                portfolioLegendEntries.length === 6
                  ? "w-full max-w-none"
                  : "min-w-30 max-w-44",
              )}
            >
              <div className="flex items-center justify-center gap-2">
                {item.id === "other-zero" ? (
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full bg-black dark:bg-white"
                    aria-hidden
                  />
                ) : (
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: item.fill,
                      opacity: item.value > 0 ? 1 : 0.35,
                    }}
                    aria-hidden
                  />
                )}
                <p className="truncate text-[11px] text-muted-foreground">
                  {item.name}
                </p>
              </div>
              <p
                className={`text-xs font-semibold tabular-nums ${
                  item.value <= 0 ? "text-muted-foreground" : ""
                }`}
              >
                {formatMoney(item.value, currency)}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
