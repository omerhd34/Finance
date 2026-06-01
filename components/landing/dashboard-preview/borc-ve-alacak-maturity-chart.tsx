/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CalendarClock } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { PreviewSectionHeader } from "@/components/landing/dashboard-preview/shared";

type MaturityRow = {
  label: string;
  alacak: number;
  borc: number;
};

const MATURITY_ROWS: MaturityRow[] = [
  { label: "Vadesiz", alacak: 0, borc: 0 },
  { label: "0-30", alacak: 150_000, borc: 0 },
  { label: "31-60", alacak: 150_000, borc: 0 },
  { label: "61-90", alacak: 0, borc: 0 },
  { label: "90+", alacak: 0, borc: 48_000 },
];

const ALACAK_FILL = "#10b981";
const BORC_FILL = "#f59e0b";
const GAP = 4;

const TICK_STYLE = {
  fontSize: 11,
  fill: "var(--muted-foreground, #94a3b8)",
  fontWeight: 500,
} as const;

function AlacakShape(props: any) {
  const { x, y, width, height, borc } = props;
  const hasBorc = (borc ?? 0) > 0;
  const drawWidth = hasBorc ? Math.max(0, width - GAP) : width;
  const r = hasBorc ? 0 : 4;

  if (drawWidth <= 0 || height <= 0) return null;

  return (
    <rect
      x={x}
      y={y}
      width={drawWidth}
      height={height}
      fill={ALACAK_FILL}
      rx={r}
      ry={r}
    />
  );
}

function formatTick(v: number): string {
  return v.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function BorcVeAlacakMaturityChart() {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-border/60 bg-card shadow-sm">
      <PreviewSectionHeader
        icon={CalendarClock}
        title="Vade dağılımı"
        description="Alacak ve borçların vade aralığına göre kalan bakiye dağılımı"
      />
      <div className="flex-1 px-3 pb-4 pt-3 sm:px-4 sm:pb-5 sm:pt-4">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: ALACAK_FILL }}
              aria-hidden
            />
            Alacak
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
            <span
              className="size-2.5 shrink-0 rounded-sm bg-amber-400"
              aria-hidden
            />
            Borç
          </span>
        </div>

        <div className="h-[240px] w-full sm:h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={MATURITY_ROWS}
              margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
              barCategoryGap="32%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                vertical
                className="stroke-border/40"
              />
              <XAxis
                type="number"
                tick={TICK_STYLE}
                tickLine={false}
                axisLine={{ stroke: "var(--border)", strokeWidth: 0.5 }}
                tickMargin={8}
                tickFormatter={(v) => formatTick(Number(v))}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={70}
                reversed
                tick={TICK_STYLE}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <Bar
                dataKey="alacak"
                stackId="a"
                fill={ALACAK_FILL}
                maxBarSize={22}
                isAnimationActive={false}
                shape={AlacakShape}
              />
              <Bar
                dataKey="borc"
                stackId="a"
                fill={BORC_FILL}
                maxBarSize={22}
                isAnimationActive={false}
              >
                {MATURITY_ROWS.map((_, i) => (
                  <Cell key={i} fill={BORC_FILL} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
