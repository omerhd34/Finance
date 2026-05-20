/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { PensionScheduleRow } from "@/lib/calculations/private-pension";
import { formatCurrency } from "./calculation-helpers";

const COLORS = {
  contribution: "#34d399",
  stateBonus: "#fbbf24",
  interest: "#38bdf8",
} as const;

const compactFmt = new Intl.NumberFormat("tr-TR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

type Props = {
  schedule: PensionScheduleRow[];
  startingAge: number;
};

export function PensionBalanceChart({ schedule, startingAge }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const data = useMemo(() => {
    let cumContribution = 0;
    let cumStateBonus = 0;
    let cumInterest = 0;
    return schedule.map((row) => {
      cumContribution += row.contribution;
      cumStateBonus += row.stateBonus;
      cumInterest += Math.max(0, row.interest);
      return {
        label: startingAge > 0 ? `${startingAge + row.year}` : `${row.year}`,
        Katkı: cumContribution,
        "Devlet Katkısı": cumStateBonus,
        Getiri: cumInterest,
      };
    });
  }, [schedule, startingAge]);

  if (!mounted) {
    return (
      <div className="h-[300px] w-full rounded-xl bg-muted/20" aria-hidden />
    );
  }

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 12, left: 4, bottom: 4 }}
          barCategoryGap="20%"
        >
          <defs>
            <linearGradient id="besContribution" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={COLORS.contribution}
                stopOpacity={0.95}
              />
              <stop
                offset="100%"
                stopColor={COLORS.contribution}
                stopOpacity={0.75}
              />
            </linearGradient>
            <linearGradient id="besStateBonus" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={COLORS.stateBonus}
                stopOpacity={0.95}
              />
              <stop
                offset="100%"
                stopColor={COLORS.stateBonus}
                stopOpacity={0.75}
              />
            </linearGradient>
            <linearGradient id="besInterest" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={COLORS.interest}
                stopOpacity={0.95}
              />
              <stop
                offset="100%"
                stopColor={COLORS.interest}
                stopOpacity={0.75}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(113,113,122,0.18)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            stroke="#71717a"
            fontSize={11}
            tickMargin={6}
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={{ stroke: "rgba(113,113,122,0.25)" }}
            label={
              startingAge > 0
                ? {
                    value: "Yaş",
                    position: "insideBottom",
                    offset: -4,
                    fontSize: 10,
                    fill: "#71717a",
                  }
                : undefined
            }
          />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickFormatter={(v) => `₺${compactFmt.format(Number(v))}`}
            width={70}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(52,211,153,0.06)" }}
            contentStyle={{
              background: "#0b1410",
              border: "1px solid rgba(52,211,153,0.25)",
              borderRadius: "12px",
              padding: "10px 12px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.4)",
            }}
            labelStyle={{
              color: "#a7f3d0",
              fontWeight: 600,
              fontSize: "12px",
              marginBottom: "6px",
            }}
            itemStyle={{ fontSize: "12px", padding: "2px 0" }}
            labelFormatter={(label) =>
              startingAge > 0 ? `${label} yaş` : `${label}. yıl`
            }
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              String(name),
            ]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={9}
            wrapperStyle={{ fontSize: "12px", paddingBottom: "8px" }}
          />
          <Bar
            dataKey="Katkı"
            stackId="bes"
            fill="url(#besContribution)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="Devlet Katkısı"
            stackId="bes"
            fill="url(#besStateBonus)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="Getiri"
            stackId="bes"
            fill="url(#besInterest)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
