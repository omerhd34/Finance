/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoneyAmount } from "@/lib/common/utils";
import type { DebtMaturityRow } from "@/lib/debts/debt-maturity-buckets";

type Props = {
  data: DebtMaturityRow[];
  currency: string;
  chartHeight?: number;
};

const ALACAK_FILL = "var(--app-income)";
const BORC_FILL = "#f59e0b";
const GAP = 5;

const TICK_STYLE = {
  fontSize: 12,
  fill: "var(--app-muted-fg)",
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

export function DashboardDebtMaturityChart({
  data,
  currency,
  chartHeight = 280,
}: Props) {
  const legend = (
    <div className="mb-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
      <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
        <span
          className="size-2.5 shrink-0 rounded-sm"
          style={{ backgroundColor: ALACAK_FILL }}
        />
        Alacak
      </span>
      <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
        <span className="size-2.5 shrink-0 rounded-sm bg-amber-400" />
        Borç
      </span>
    </div>
  );

  if (data.length === 0) {
    return (
      <div className="border-t border-border px-4 pb-8 pt-6 sm:px-6">
        {legend}
        <div
          className="flex items-center justify-center px-4 text-center text-sm text-muted-foreground"
          style={{ height: chartHeight }}
        >
          Bu özet için gösterilecek vadeli kalan bakiye yok.
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border px-4 pb-8 pt-6 sm:px-6">
      {legend}

      <div
        className="w-full"
        style={{ height: chartHeight }}
        onMouseDownCapture={(e) => e.preventDefault()}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            barCategoryGap="28%"
            tabIndex={-1}
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
              tickMargin={10}
              tickFormatter={(v) => formatMoneyAmount(Number(v), currency)}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={84}
              reversed
              tick={TICK_STYLE}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.2 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as DebtMaturityRow;
                const total = row.alacak + row.borc;
                return (
                  <div className="rounded-xl border border-border bg-popover px-4 py-3 text-xs shadow-xl">
                    <p className="mb-2.5 border-b border-border pb-2 text-sm font-semibold text-foreground">
                      {row.tooltipLabel}
                    </p>
                    <div className="space-y-1.5">
                      {row.alacak > 0 && (
                        <div className="flex items-center justify-between gap-8">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span
                              className="size-2 rounded-sm"
                              style={{ backgroundColor: ALACAK_FILL }}
                            />
                            Alacak
                          </span>
                          <span className="font-semibold tabular-nums text-income">
                            {formatMoneyAmount(row.alacak, currency)}
                          </span>
                        </div>
                      )}
                      {row.borc > 0 && (
                        <div className="flex items-center justify-between gap-8">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="size-2 rounded-sm bg-amber-400" />
                            Borç
                          </span>
                          <span className="font-semibold tabular-nums text-amber-500">
                            {formatMoneyAmount(row.borc, currency)}
                          </span>
                        </div>
                      )}
                      {row.alacak > 0 && row.borc > 0 && (
                        <div className="flex items-center justify-between gap-8 border-t border-border pt-1.5">
                          <span className="text-muted-foreground">Toplam</span>
                          <span className="font-semibold tabular-nums text-foreground">
                            {formatMoneyAmount(total, currency)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            <Bar
              dataKey="alacak"
              stackId="a"
              fill={ALACAK_FILL}
              maxBarSize={36}
              isAnimationActive={false}
              shape={AlacakShape}
            />

            <Bar
              dataKey="borc"
              stackId="a"
              fill={BORC_FILL}
              maxBarSize={36}
              isAnimationActive={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={BORC_FILL} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
