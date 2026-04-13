"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyBarRow } from "@/lib/dashboard-stats";
import { formatMoney } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { useBlockChartPointerActivation } from "@/components/charts/use-block-chart-pointer-activation";

type LegendPayload = {
  value?: string;
  color?: string;
};

function MonthlyBarLegendContent(props: {
  payload?: readonly LegendPayload[];
}) {
  return <MonthlyBarLegend payload={props.payload} />;
}

function MonthlyBarLegend({ payload }: { payload?: readonly LegendPayload[] }) {
  if (!payload?.length) return null;
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2.5 border-t border-border/40 pt-4">
      {payload.map((entry, i) => (
        <li key={i} className="flex items-center gap-3">
          <span
            className="h-2.5 w-6 shrink-0 rounded-[3px] shadow-sm ring-1 ring-white/15"
            style={{ backgroundColor: entry.color }}
            aria-hidden
          />
          <span className="text-sm font-medium tabular-nums tracking-tight text-foreground/90">
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function MonthlyBarChart({ data }: { data: MonthlyBarRow[] }) {
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [mounted, setMounted] = useState(false);
  const blockInteractionRef = useRef<HTMLDivElement>(null);
  useBlockChartPointerActivation(blockInteractionRef, mounted);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const { yDomainMax, yTicks } = useMemo(() => {
    let maxVal = 0;
    const raw = new Set<number>([0]);
    for (const row of data) {
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
  }, [data]);

  if (!mounted) {
    return (
      <div
        className="h-[300px] w-full min-w-0 rounded-md bg-muted/20"
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={blockInteractionRef}
      className="h-[300px] w-full min-w-0 cursor-default select-none mt-5 overflow-x-visible"
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={280}
      >
        <BarChart
          data={data}
          margin={{ top: 28, right: 12, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="label" stroke="#71717a" fontSize={12} />
          <YAxis
            type="number"
            domain={[0, yDomainMax]}
            ticks={yTicks}
            allowDecimals
            width={100}
            stroke="#71717a"
            fontSize={12}
            tickFormatter={(v) => {
              const n = Math.max(0, Number(v));
              return formatMoney(n, currency).replace(/\s/g, " ");
            }}
          />
          <Tooltip
            contentStyle={{
              background: "#111111",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff" }}
            formatter={(value) => formatMoney(Number(value ?? 0), currency)}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            content={MonthlyBarLegendContent}
          />
          <Bar
            dataKey="gelir"
            name="Gelir"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
            activeBar={false}
          />
          <Bar
            dataKey="gider"
            name="Gider"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            activeBar={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
