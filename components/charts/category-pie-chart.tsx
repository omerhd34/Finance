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
  const { x, y, cx, cy, name, percent, fill, textAnchor } = props;
  const pct = Math.round((percent ?? 0) * 100);

  const px = Number(x);
  const py = Number(y);
  const pcx = Number(cx);
  const pcy = Number(cy);
  let tx = px;
  let ty = py;
  if (
    Number.isFinite(px) &&
    Number.isFinite(py) &&
    Number.isFinite(pcx) &&
    Number.isFinite(pcy)
  ) {
    const dx = px - pcx;
    const dy = py - pcy;
    const len = Math.hypot(dx, dy) || 1;
    tx = pcx + (dx / len) * (len + 12);
    ty = pcy + (dy / len) * (len + 12);
  }

  return (
    <text
      x={tx}
      y={ty}
      textAnchor={textAnchor}
      fill={fill}
      dominantBaseline="middle"
      style={{
        fontSize: 13,
        fontWeight: 600,
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        fontFeatureSettings: '"tnum"',
      }}
    >
      {name}
      <tspan style={{ fontWeight: 500, opacity: 0.92 }}>{` ${pct}%`}</tspan>
    </text>
  );
}

export function CategoryPieChart({ data }: { data: CategorySlice[] }) {
  const router = useRouter();
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [mounted, setMounted] = useState(false);

  const chartData = useMemo(
    () => [...data].sort((a, b) => b.value - a.value),
    [data],
  );

  const monthTotal = useMemo(
    () => chartData.reduce((s, d) => s + d.value, 0),
    [chartData],
  );

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (data.length === 0) {
    return (
      <p className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        Bu ay için gider kaydı yok.
      </p>
    );
  }

  if (!mounted) {
    return (
      <div
        className="h-[400px] w-full min-w-0 rounded-md bg-muted/20"
        aria-hidden
      />
    );
  }

  return (
    <div
      className="relative h-[400px] w-full min-w-0 cursor-pointer [-webkit-tap-highlight-color:transparent] **:outline-none **:focus-visible:outline-none [&_path]:outline-none [&_.recharts-active-shape]:shadow-none"
      onMouseDown={(e) => e.preventDefault()}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={320}
      >
        <PieChart
          margin={{ top: 12, right: 56, bottom: 22, left: 56 }}
          style={{ shapeRendering: "geometricPrecision" }}
        >
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="44%"
            outerRadius="78%"
            paddingAngle={1.25}
            stroke="#2a2a2a"
            strokeWidth={1.5}
            cornerRadius={2}
            label={CategoryLabel}
            labelLine={{ strokeWidth: 1.35, strokeOpacity: 0.92 }}
            isAnimationActive="auto"
            animationDuration={600}
            animationEasing="ease-out"
            onClick={(sector) => {
              const name =
                sector.name != null
                  ? String(sector.name)
                  : String(
                      (sector.payload as { name?: string } | undefined)?.name ??
                        "",
                    );
              if (!name.trim()) return;
              const p = new URLSearchParams();
              p.set("category", name);
              p.set("type", "expense");
              router.push(`/transactions?${p.toString()}`);
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
            cursor={false}
            contentStyle={{
              background: "#111111",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
              fontSize: 14,
            }}
            formatter={(value) => {
              const v = Number(value ?? 0);
              const total = monthTotal || 1;
              const p = Math.round((v / total) * 1000) / 10;
              return `${formatMoney(v, currency)} (${p.toLocaleString("tr-TR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              })}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div className="text-center">
          <span className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
            {formatMoney(monthTotal, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
