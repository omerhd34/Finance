/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { CategorySlice } from "@/lib/dashboard-stats";
import { formatMoney } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

const SLICE_COLORS = [
  "#22c55e",
  "#a855f7",
  "#f97316",
  "#eab308",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#64748b",
];

function CategoryLabel(props: PieLabelRenderProps) {
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
      {percent && percent > 0.05 ? `${Math.round(percent * 100)}%` : ""}
    </text>
  );
}

export function CategoryPieChart({ data }: { data: CategorySlice[] }) {
  const router = useRouter();
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const chartData = useMemo(
    () => [...data].sort((a, b) => b.value - a.value),
    [data],
  );
  const monthTotal = useMemo(
    () => chartData.reduce((s, d) => s + d.value, 0),
    [chartData],
  );

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (data.length === 0)
    return (
      <p className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        Kayıt yok.
      </p>
    );
  if (!mounted)
    return <div className="h-[400px] w-full bg-muted/20 rounded-lg" />;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative h-[300px] md:h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? "50%" : "44%"}
              outerRadius={isMobile ? "90%" : "80%"}
              paddingAngle={2}
              stroke="#1a1a1a"
              strokeWidth={2}
              label={CategoryLabel}
              labelLine={false}
              onClick={(sector) => {
                const name = sector.name || sector.payload?.name;
                if (name)
                  router.push(`/transactions?category=${name}&type=expense`);
              }}
            >
              {chartData.map((_, i) => (
                <Cell
                  key={`c-${i}`}
                  fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#111",
                border: "1px solid #333",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: any) => [
                formatMoney(Number(value || 0), currency),
                "Tutar",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-tighter text-muted-foreground">
              Toplam
            </p>
            <p className="text-sm md:text-base font-bold tabular-nums">
              {formatMoney(monthTotal, currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full px-4 mt-6 border-t border-border/40 pt-6">
        {chartData.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-muted-foreground truncate leading-none mb-1">
                {item.name}
              </span>
              <span className="text-[12px] font-semibold text-foreground leading-none">
                {formatMoney(item.value, currency)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
