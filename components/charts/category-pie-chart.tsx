/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CategorySlice } from "@/lib/dashboard/dashboard-stats";
import { cn, formatMoney } from "@/lib/common/utils";
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

type CategoryPieChartProps = {
  data: CategorySlice[];
  chartClassName?: string;
};

type Arc = {
  name: string;
  color: string;
  value: number;
  pct: number;
  length: number;
  offset: number;
};

export function CategoryPieChart({
  data,
  chartClassName,
}: CategoryPieChartProps) {
  const router = useRouter();
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "TL");
  const [mounted, setMounted] = useState(false);
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const chartData = useMemo(
    () => [...data].sort((a, b) => b.value - a.value),
    [data],
  );
  const monthTotal = useMemo(
    () => chartData.reduce((s, d) => s + d.value, 0),
    [chartData],
  );

  const radius = 36;
  const innerRadius = 22;
  const circumference = 2 * Math.PI * radius;

  const arcs = useMemo<Arc[]>(() => {
    if (monthTotal <= 0) return [];
    const result: Arc[] = [];
    let cursor = 0;
    chartData.forEach((slice, i) => {
      const pct = (slice.value / monthTotal) * 100;
      const length = (slice.value / monthTotal) * circumference;
      result.push({
        name: slice.name,
        color: SLICE_COLORS[i % SLICE_COLORS.length],
        value: slice.value,
        pct,
        length,
        offset: cursor,
      });
      cursor += length;
    });
    return result;
  }, [chartData, monthTotal, circumference]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartHeightClass = cn(
    "relative h-[300px] w-full md:h-[380px]",
    chartClassName,
  );

  if (data.length === 0)
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground",
          chartHeightClass,
        )}
      >
        <p>Kayıt yok.</p>
        <Link
          href="/islemler"
          className="font-medium text-primary underline-offset-4 transition hover:text-primary/90 hover:underline"
        >
          İşlemlere git
        </Link>
      </div>
    );
  if (!mounted)
    return (
      <div className={cn("w-full rounded-lg bg-muted/20", chartHeightClass)} />
    );

  const hovered = hoveredName
    ? (arcs.find((a) => a.name === hoveredName) ?? null)
    : null;

  return (
    <div className="flex w-full flex-col items-center">
      <div className={cn("flex items-center justify-center", chartHeightClass)}>
        <div className="relative h-full aspect-square max-h-full">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full -rotate-90"
            role="img"
            aria-label="Kategori giderleri donut grafiği"
          >
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={radius - innerRadius}
              className="text-muted/40"
            />
            {arcs.map((arc) => {
              const isDimmed = hoveredName !== null && hoveredName !== arc.name;
              return (
                <circle
                  key={arc.name}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={radius - innerRadius}
                  strokeDasharray={`${arc.length} ${circumference}`}
                  strokeDashoffset={-arc.offset}
                  opacity={isDimmed ? 0.35 : 1}
                  style={{
                    pointerEvents: "stroke",
                    cursor: "pointer",
                    transition: "opacity 150ms ease-out",
                  }}
                  onMouseEnter={() => setHoveredName(arc.name)}
                  onMouseLeave={() => setHoveredName(null)}
                  onFocus={() => setHoveredName(arc.name)}
                  onBlur={() => setHoveredName(null)}
                  onClick={() =>
                    router.push(
                      `/islemler?category=${encodeURIComponent(arc.name)}&type=expense`,
                    )
                  }
                  tabIndex={0}
                  role="button"
                  aria-label={`${arc.name}: ${formatMoney(arc.value, currency)} (%${arc.pct.toFixed(1)})`}
                />
              );
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {hovered ? (
              <>
                <span
                  className="text-xs font-medium uppercase tracking-wider sm:text-sm"
                  style={{ color: hovered.color }}
                >
                  {hovered.name}
                </span>
                <span className="text-lg font-semibold tabular-nums text-foreground sm:text-xl md:text-2xl">
                  {formatMoney(hovered.value, currency)}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground sm:text-sm">
                  %{hovered.pct.toFixed(1)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] uppercase tracking-tighter text-muted-foreground sm:text-xs">
                  Toplam
                </span>
                <span className="text-base font-bold tabular-nums sm:text-lg md:text-xl">
                  {formatMoney(monthTotal, currency)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid w-full grid-cols-2 gap-x-6 gap-y-3 border-t border-border/40 px-4 pt-6 md:hidden">
        {arcs.map((arc) => (
          <div key={arc.name} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: arc.color }}
            />
            <div className="flex min-w-0 flex-col">
              <span className="mb-1 truncate text-[11px] leading-none text-muted-foreground">
                {arc.name}
              </span>
              <span className="text-[12px] font-semibold leading-none text-foreground">
                {formatMoney(arc.value, currency)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
