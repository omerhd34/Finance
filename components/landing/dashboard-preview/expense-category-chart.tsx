"use client";

import { useState } from "react";
import { PieChart } from "lucide-react";
import {
  PreviewSectionHeader,
  formatTL,
} from "@/components/landing/dashboard-preview/shared";

const EXPENSE_CATEGORIES = [
  { id: "market", label: "Market", value: 9_100, color: "#22c55e" },
  { id: "yemek", label: "Yemek", value: 3_300, color: "#a855f7" },
  { id: "ulasim", label: "Ulaşım", value: 1_650, color: "#f97316" },
  { id: "fatura", label: "Fatura", value: 1_400, color: "#eab308" },
  { id: "eglence", label: "Eğlence", value: 1_100, color: "#3b82f6" },
  { id: "saglik", label: "Sağlık", value: 850, color: "#ec4899" },
  { id: "giyim", label: "Giyim", value: 700, color: "#14b8a6" },
  { id: "abonelik", label: "Abonelik", value: 580, color: "#8b5cf6" },
  { id: "diger", label: "Diğer", value: 427.26, color: "#64748b" },
];

const EXPENSE_TOTAL_LABEL = "₺19.107,26";
const EXPENSE_TOTAL_VALUE = EXPENSE_CATEGORIES.reduce(
  (acc, c) => acc + c.value,
  0,
);

export function ExpenseCategoryChart() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const radius = 36;
  const innerRadius = 22;
  const circumference = 2 * Math.PI * radius;

  const arcs = EXPENSE_CATEGORIES.reduce<
    Array<{
      id: string;
      label: string;
      color: string;
      value: number;
      length: number;
      offset: number;
      pct: number;
    }>
  >((acc, cat) => {
    const pct = (cat.value / EXPENSE_TOTAL_VALUE) * 100;
    const length = (cat.value / EXPENSE_TOTAL_VALUE) * circumference;
    const prevOffset =
      acc.length === 0
        ? 0
        : acc[acc.length - 1].offset + acc[acc.length - 1].length;
    acc.push({
      id: cat.id,
      label: cat.label,
      color: cat.color,
      value: cat.value,
      length,
      offset: prevOffset,
      pct,
    });
    return acc;
  }, []);

  const hovered = hoveredId ? arcs.find((a) => a.id === hoveredId) : null;

  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-border/60 bg-card shadow-sm">
      <PreviewSectionHeader
        icon={PieChart}
        title="Kategori Giderleri"
        description="15 Mayıs - 15 Haziran döneminde giderlerin kategori bazında toplam dağılımı"
      />
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="relative shrink-0">
          <svg
            viewBox="0 0 100 100"
            className="h-48 w-48 -rotate-90 sm:h-60 sm:w-60 lg:h-64 lg:w-64"
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
              const isDimmed = hoveredId !== null && hoveredId !== arc.id;
              return (
                <circle
                  key={arc.id}
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
                  onMouseEnter={() => setHoveredId(arc.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(arc.id)}
                  onBlur={() => setHoveredId(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${arc.label}: ${formatTL(arc.value)} (%${arc.pct.toFixed(1)})`}
                />
              );
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {hovered ? (
              <>
                <span
                  className="text-[10px] font-medium uppercase tracking-wider sm:text-xs"
                  style={{ color: hovered.color }}
                >
                  {hovered.label}
                </span>
                <span className="text-base font-semibold tabular-nums text-foreground sm:text-lg">
                  {formatTL(hovered.value)}
                </span>
                <span className="text-[10px] tabular-nums text-muted-foreground sm:text-xs">
                  %{hovered.pct.toFixed(1)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                  Toplam
                </span>
                <span className="text-base font-semibold tabular-nums text-foreground sm:text-lg">
                  {EXPENSE_TOTAL_LABEL}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
