"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/common/utils";
import type { PortfolioBarRow } from "@/lib/investments/portfolio-charts-shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  barChartRows: PortfolioBarRow[];
  currency: string;
};

export function PortfolioPnlBarCard({ barChartRows, currency }: Props) {
  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Kar / zarar</CardTitle>
        <CardDescription>
          Her varlık grubunun tahmini kar veya zararı
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center pb-6 pt-6">
        <div
          className="h-[280px] w-full shrink-0 md:h-[320px] outline-none **:outline-none **:focus-visible:outline-none [&_svg]:outline-none"
          onMouseDownCapture={(e) => e.preventDefault()}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              className="[&_.recharts-surface]:outline-none [&_.recharts-surface:focus]:outline-none [&_.recharts-wrapper]:outline-none [&_svg]:outline-none"
              data={barChartRows}
              margin={{ top: 16, right: 8, left: -10, bottom: 0 }}
              barCategoryGap="18%"
              tabIndex={-1}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/60"
                vertical={false}
              />
              <XAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={0}
                height={36}
              />
              <YAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  formatMoney(Number(v), currency).replace(/\s/g, " ")
                }
                width={72}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as PortfolioBarRow;
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                      <p className="font-semibold">{row.name}</p>
                      <p
                        className={
                          row.pnl > 0
                            ? "text-foreground"
                            : row.pnl < 0
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }
                      >
                        {row.pnl > 0 ? "+" : ""}
                        {formatMoney(row.pnl, currency)}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {barChartRows.map((entry) => {
                  const flat = entry.pnl === 0;
                  return (
                    <Cell
                      key={
                        entry.type === "OTHER_BAR"
                          ? "b-other-bar"
                          : `b-${entry.type}`
                      }
                      fill={entry.fill}
                      fillOpacity={flat ? 0.35 : 0.92}
                    />
                  );
                })}
              </Bar>
              <ReferenceLine
                y={0}
                stroke="hsl(var(--foreground))"
                strokeOpacity={0.55}
                strokeWidth={1.5}
                ifOverflow="extendDomain"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
