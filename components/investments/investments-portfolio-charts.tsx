"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { LiveInvestmentQuotes } from "@/lib/investments/investment-position-math";
import {
  costBasisTry,
  valueTry,
} from "@/lib/investments/investment-position-math";
import { formatMoney } from "@/lib/common/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  InvestmentAssetType,
  InvestmentPosition,
} from "@/types/investment";

const ASSET_ORDER: InvestmentAssetType[] = [
  "GOLD",
  "SILVER",
  "PLATINUM",
  "FX",
  "STOCK",
  "CRYPTO",
];

const SLICE_COLORS = [
  "#eab308",
  "#C0C0C0",
  "#E5E4E2",
  "#3b82f6",
  "#008000",
  "#F7931A",
];

function assetTypeLabel(t: InvestmentAssetType): string {
  switch (t) {
    case "GOLD":
      return "Altın";
    case "SILVER":
      return "Gümüş";
    case "PLATINUM":
      return "Platin";
    case "FX":
      return "Döviz";
    case "STOCK":
      return "Hisse";
    case "CRYPTO":
      return "Kripto";
    default:
      return t;
  }
}

function PieSliceLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (
    cx === undefined ||
    cy === undefined ||
    midAngle === undefined ||
    innerRadius === undefined ||
    outerRadius === undefined
  ) {
    return null;
  }
  const RADIAN = Math.PI / 180;
  const radius =
    Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
  const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
  const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[11px] font-bold"
    >
      {percent && percent > 0.06 ? `${Math.round(percent * 100)}%` : ""}
    </text>
  );
}

type Props = {
  items: InvestmentPosition[];
  liveQuotes?: LiveInvestmentQuotes;
  currency: string;
};

export function InvestmentsPortfolioCharts({
  items,
  liveQuotes,
  currency,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const rows = useMemo(() => {
    const acc = new Map<InvestmentAssetType, { value: number; cost: number }>();
    for (const t of ASSET_ORDER) {
      acc.set(t, { value: 0, cost: 0 });
    }
    for (const p of items) {
      const cur = acc.get(p.assetType);
      if (!cur) continue;
      cur.value += valueTry(p, liveQuotes);
      cur.cost += costBasisTry(p);
    }
    return ASSET_ORDER.map((type) => {
      const u = acc.get(type)!;
      return {
        type,
        name: assetTypeLabel(type),
        value: u.value,
        cost: u.cost,
        pnl: u.value - u.cost,
        fill: SLICE_COLORS[ASSET_ORDER.indexOf(type) % SLICE_COLORS.length],
      };
    });
  }, [items, liveQuotes]);

  const pieData = useMemo(
    () =>
      rows
        .filter((r) => r.value > 0)
        .map((r) => ({
          name: r.name,
          value: r.value,
          fill: r.fill,
        })),
    [rows],
  );

  const pieTotal = useMemo(() => rows.reduce((s, r) => s + r.value, 0), [rows]);

  if (items.length === 0) {
    return null;
  }

  if (!mounted) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[320px] rounded-xl border border-border bg-muted/15" />
        <div className="h-[320px] rounded-xl border border-border bg-muted/15" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="overflow-hidden">
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
              className="relative h-[280px] w-full md:h-[300px] outline-none **:outline-none **:focus-visible:outline-none [&_svg]:outline-none"
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
                    innerRadius="48%"
                    outerRadius="78%"
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
          <ul className="mt-4 grid grid-cols-2 gap-3 border-t border-border/40 pt-4 sm:grid-cols-3">
            {rows.map((item) => (
              <li key={item.type} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{
                    backgroundColor: item.fill,
                    opacity: item.value > 0 ? 1 : 0.35,
                  }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="truncate text-[11px] text-muted-foreground">
                    {item.name}
                  </p>
                  <p
                    className={`text-xs font-semibold tabular-nums ${
                      item.value <= 0 ? "text-muted-foreground" : ""
                    }`}
                  >
                    {formatMoney(item.value, currency)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Kar / zarar</CardTitle>
          <CardDescription>
            Her varlık grubunun tahmini kar veya zararı
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4 pt-2">
          <div
            className="h-[280px] w-full md:h-[320px] outline-none **:outline-none **:focus-visible:outline-none [&_svg]:outline-none"
            onMouseDownCapture={(e) => e.preventDefault()}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                className="[&_.recharts-surface]:outline-none [&_.recharts-surface:focus]:outline-none [&_.recharts-wrapper]:outline-none [&_svg]:outline-none"
                data={rows}
                margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
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
                  angle={-25}
                  textAnchor="end"
                  height={56}
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
                <ReferenceLine
                  y={0}
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity={0.35}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload as (typeof rows)[0];
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
                  {rows.map((entry, i) => {
                    const loss = entry.pnl < 0;
                    const flat = entry.pnl === 0;
                    return (
                      <Cell
                        key={`b-${i}`}
                        fill={loss ? "#ef4444" : entry.fill}
                        fillOpacity={loss ? 0.88 : flat ? 0.35 : 0.92}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
