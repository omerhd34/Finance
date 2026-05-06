"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
} from "recharts";
import type { MonthlyBarRow } from "@/lib/dashboard/dashboard-stats";
import { cn, formatMoney } from "@/lib/common/utils";
import { useAppSelector } from "@/store/hooks";
import { useBlockChartPointerActivation } from "@/components/charts/use-block-chart-pointer-activation";
import defaultTheme from "tailwindcss/defaultTheme";

type LegendPayload = {
  value?: string;
  color?: string;
};

function MonthlyBarLegend({
  payload,
  narrow,
}: {
  payload?: readonly LegendPayload[];
  narrow: boolean;
}) {
  if (!payload?.length) return null;
  return (
    <div
      className={cn(
        "w-full max-w-none border-t border-border/40",
        narrow ? "mt-1 pt-4" : "pt-4",
      )}
    >
      <ul
        className={cn(
          "flex w-full flex-wrap items-center justify-center gap-y-2.5",
          narrow ? "gap-x-6" : "gap-x-10",
        )}
      >
        {payload.map((entry, i) => (
          <li key={i} className="flex items-center gap-3">
            <span
              className="h-0.5 w-7 shrink-0 rounded-full shadow-sm ring-1 ring-white/15"
              style={{ backgroundColor: entry.color }}
              aria-hidden
            />
            <span className="text-sm font-medium tabular-nums tracking-tight text-foreground/90">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const MOBILE_SERIES_LEGEND: readonly LegendPayload[] = [
  { value: "Gelir", color: "#22c55e" },
  { value: "Gider", color: "#ef4444" },
  { value: "Tasarruf Oranı", color: "#38bdf8" },
];

export function MonthlyBarChart({ data }: { data: MonthlyBarRow[] }) {
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [mounted, setMounted] = useState(false);
  const [narrowChart, setNarrowChart] = useState(false);
  const blockInteractionRef = useRef<HTMLDivElement>(null);
  useBlockChartPointerActivation(blockInteractionRef, mounted);
  const chartData = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        tasarrufOrani:
          row.gelir > 0 ? ((row.gelir - row.gider) / row.gelir) * 100 : null,
      })),
    [data],
  );

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(`(width < ${defaultTheme.screens.sm})`);
    const sync = () => setNarrowChart(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const chartMargin = useMemo(
    () =>
      narrowChart
        ? ({
            top: 22,
            right: 4,
            left: -4,
            bottom: 28,
          } as const)
        : ({
            top: 28,
            right: 12,
            left: -20,
            bottom: 8,
          } as const),
    [narrowChart],
  );

  const { yDomainMax, yTicks } = useMemo(() => {
    let maxVal = 0;
    const raw = new Set<number>([0]);
    for (const row of chartData) {
      raw.add(row.gelir);
      raw.add(row.gider);
      maxVal = Math.max(maxVal, row.gelir, row.gider);
    }

    const seen = new Set<number>();
    const ticks: number[] = [];
    for (const n of [...raw].sort((a, b) => a - b)) {
      const rounded = Math.round(n * 100) / 100;
      if (seen.has(rounded)) continue;
      seen.add(rounded);
      ticks.push(rounded);
    }

    if (maxVal <= 0) {
      return { yDomainMax: 1, yTicks: [0, 1] as number[] };
    }

    const headroom = 1.05;
    const domainTop = maxVal * headroom;

    const ticksInDomain = ticks.filter((t) => t <= domainTop);
    if (ticksInDomain.length === 0) {
      return { yDomainMax: domainTop, yTicks: [0, domainTop] };
    }

    return { yDomainMax: domainTop, yTicks: ticksInDomain };
  }, [chartData]);

  const { savingsMin, savingsMax } = useMemo(() => {
    const rates = chartData
      .map((row) => row.tasarrufOrani)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));

    if (rates.length === 0) return { savingsMin: -100, savingsMax: 100 };

    const min = Math.min(...rates, 0);
    const max = Math.max(...rates, 0);
    const pad = Math.max((max - min) * 0.12, 5);

    return {
      savingsMin: Math.floor(min - pad),
      savingsMax: Math.ceil(max + pad),
    };
  }, [chartData]);

  if (!mounted) {
    return (
      <div
        className={cn(
          "w-full min-w-0 rounded-md bg-muted/20",
          narrowChart ? "h-[340px]" : "h-[400px]",
        )}
        aria-hidden
      />
    );
  }

  const chartBody = (
    <AreaChart data={chartData} margin={chartMargin}>
      <defs>
        <linearGradient id="gelirGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.08} />
          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="giderGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.08} />
          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
      <XAxis
        dataKey="label"
        stroke="#71717a"
        fontSize={narrowChart ? 10 : 12}
        tickMargin={6}
        interval={narrowChart ? 0 : "preserveStartEnd"}
        angle={narrowChart ? -32 : 0}
        textAnchor={narrowChart ? "end" : "middle"}
        height={narrowChart ? 46 : undefined}
      />
      <YAxis
        type="number"
        yAxisId="amount"
        domain={[0, yDomainMax]}
        ticks={yTicks}
        allowDecimals
        padding={narrowChart ? { top: 0, bottom: 14 } : { top: 0, bottom: 0 }}
        width={narrowChart ? 76 : 100}
        stroke="#71717a"
        fontSize={12}
        tickFormatter={(v) => {
          const n = Math.max(0, Number(v));
          return formatMoney(n, currency).replace(/\s/g, " ");
        }}
      />
      <YAxis
        yAxisId="percent"
        orientation="right"
        domain={[savingsMin, savingsMax]}
        padding={narrowChart ? { top: 0, bottom: 14 } : { top: 0, bottom: 0 }}
        width={narrowChart ? 36 : 52}
        stroke="#71717a"
        fontSize={12}
        tickFormatter={(v) => `${Math.round(Number(v))}%`}
      />
      <Tooltip
        contentStyle={{
          background: "#111111",
          border: "1px solid #2a2a2a",
          borderRadius: "8px",
        }}
        labelStyle={{ color: "#fff" }}
        formatter={(value, name) => {
          if (name === "Tasarruf Oranı") {
            return [`${Number(value ?? 0).toFixed(1)}%`, "Tasarruf Oranı"];
          }
          return [formatMoney(Number(value ?? 0), currency), String(name)];
        }}
      />
      {!narrowChart ? (
        <Legend
          verticalAlign="bottom"
          align="center"
          content={(props) => (
            <div className="w-full min-w-0">
              <MonthlyBarLegend payload={props.payload} narrow={false} />
            </div>
          )}
        />
      ) : null}
      <Area
        type="monotone"
        yAxisId="amount"
        dataKey="gelir"
        name="Gelir"
        stroke="#22c55e"
        strokeWidth={2}
        fill="url(#gelirGrad)"
        dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }}
        activeDot={{ r: 5 }}
      />
      <Area
        type="monotone"
        yAxisId="amount"
        dataKey="gider"
        name="Gider"
        stroke="#ef4444"
        strokeWidth={2}
        fill="url(#giderGrad)"
        dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }}
        activeDot={{ r: 5 }}
      />
      <Area
        type="monotone"
        yAxisId="percent"
        dataKey="tasarrufOrani"
        name="Tasarruf Oranı"
        stroke="#38bdf8"
        strokeWidth={2}
        fill="none"
        connectNulls
        dot={{ r: 3, fill: "#38bdf8", strokeWidth: 0 }}
        activeDot={{ r: 5 }}
      />
    </AreaChart>
  );

  return (
    <div
      ref={blockInteractionRef}
      className={cn(
        "mt-5 w-full min-w-0 cursor-default select-none",
        narrowChart ? "flex flex-col gap-3" : "h-[400px] overflow-x-visible",
      )}
    >
      <div
        className={cn(
          "min-h-0 w-full min-w-0",
          narrowChart ? "h-[300px]" : "h-full",
        )}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={narrowChart ? 280 : 360}
        >
          {chartBody}
        </ResponsiveContainer>
      </div>
      {narrowChart ? (
        <MonthlyBarLegend payload={MOBILE_SERIES_LEGEND} narrow />
      ) : null}
    </div>
  );
}
