"use client";

import { useEffect, useRef, useState } from "react";
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

export function MonthlyBarChart({ data }: { data: MonthlyBarRow[] }) {
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [mounted, setMounted] = useState(false);
  const blockInteractionRef = useRef<HTMLDivElement>(null);
  useBlockChartPointerActivation(blockInteractionRef, mounted);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

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
      className="h-[300px] w-full min-w-0 cursor-default select-none mt-5"
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={280}
      >
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="label" stroke="#71717a" fontSize={12} />
          <YAxis
            stroke="#71717a"
            fontSize={12}
            tickFormatter={(v) =>
              formatMoney(Number(v), currency).replace(/\s/g, " ")
            }
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
          <Legend />
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
