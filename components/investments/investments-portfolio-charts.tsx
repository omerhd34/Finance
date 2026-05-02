"use client";

import { useEffect, useMemo, useState } from "react";
import type { LiveInvestmentQuotes } from "@/lib/investments/investment-position-math";
import {
  costBasisTry,
  valueTry,
} from "@/lib/investments/investment-position-math";
import {
  type PortfolioBarRow,
  type PortfolioLegendEntry,
  type PortfolioPieDatum,
  PORTFOLIO_ASSET_ORDER,
  PORTFOLIO_SLICE_COLORS,
  portfolioAssetTypeLabel,
} from "@/lib/investments/portfolio-charts-shared";
import type {
  InvestmentAssetType,
  InvestmentPosition,
} from "@/types/investment";
import { PortfolioPieCard } from "./portfolio-charts/portfolio-pie-card";
import { PortfolioPnlBarCard } from "./portfolio-charts/portfolio-pnl-bar-card";

type Props = {
  items: InvestmentPosition[];
  liveQuotes?: LiveInvestmentQuotes;
  currency: string;
};

export function InvestmentsPortfolioCharts({
  items,
  liveQuotes,
  currency,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const rows = useMemo(() => {
    const acc = new Map<InvestmentAssetType, { value: number; cost: number }>();
    for (const t of PORTFOLIO_ASSET_ORDER) {
      acc.set(t, { value: 0, cost: 0 });
    }
    for (const p of items) {
      const cur = acc.get(p.assetType);
      if (!cur) continue;
      cur.value += valueTry(p, liveQuotes);
      cur.cost += costBasisTry(p);
    }
    return PORTFOLIO_ASSET_ORDER.map((type) => {
      const u = acc.get(type)!;
      return {
        type,
        name: portfolioAssetTypeLabel(type),
        value: u.value,
        cost: u.cost,
        pnl: u.value - u.cost,
        fill: PORTFOLIO_SLICE_COLORS[
          PORTFOLIO_ASSET_ORDER.indexOf(type) % PORTFOLIO_SLICE_COLORS.length
        ],
      };
    });
  }, [items, liveQuotes]);

  const pieData = useMemo((): PortfolioPieDatum[] => {
    return rows
      .filter((r) => r.value > 0)
      .map((r) => ({
        name: r.name,
        value: r.value,
        fill: r.fill,
      }));
  }, [rows]);

  const pieTotal = useMemo(() => rows.reduce((s, r) => s + r.value, 0), [rows]);

  const portfolioLegendEntries = useMemo((): PortfolioLegendEntry[] => {
    const sorted = [...rows].sort((a, b) => b.value - a.value);
    const withBalance = sorted.filter((r) => r.value > 0);
    const zeroBalance = sorted.filter((r) => r.value <= 0);
    const entries: PortfolioLegendEntry[] = withBalance.map((r) => ({
      id: r.type,
      name: r.name,
      value: r.value,
      fill: r.fill,
    }));
    if (zeroBalance.length === 1) {
      const z = zeroBalance[0];
      entries.push({
        id: z.type,
        name: z.name,
        value: 0,
        fill: z.fill,
      });
    } else if (zeroBalance.length > 1) {
      entries.push({
        id: "other-zero",
        name: "Diğer",
        value: 0,
        fill: "hsl(var(--muted-foreground))",
      });
    }
    return entries;
  }, [rows]);

  const barChartRows = useMemo((): PortfolioBarRow[] => {
    const sorted = [...rows].sort((a, b) => b.pnl - a.pnl);
    const nonZero = sorted.filter((r) => r.pnl !== 0);
    const zero = sorted.filter((r) => r.pnl === 0);

    if (nonZero.length === 0 || zero.length === 0) {
      return sorted;
    }

    if (nonZero.length === 5 && zero.length === 1) {
      return sorted;
    }

    const restPnl = zero.reduce((s, z) => s + z.pnl, 0);
    const diğerRow: PortfolioBarRow = {
      type: "OTHER_BAR",
      name: "Diğer",
      pnl: restPnl,
      value: 0,
      cost: 0,
      fill: "hsl(var(--muted-foreground))",
    };

    return [...nonZero, diğerRow].sort((a, b) => b.pnl - a.pnl);
  }, [rows]);

  if (items.length === 0) {
    return null;
  }

  if (!mounted) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[380px] rounded-xl border border-border bg-muted/15" />
        <div className="h-[380px] rounded-xl border border-border bg-muted/15" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PortfolioPieCard
        pieData={pieData}
        pieTotal={pieTotal}
        portfolioLegendEntries={portfolioLegendEntries}
        currency={currency}
      />
      <PortfolioPnlBarCard barChartRows={barChartRows} currency={currency} />
    </div>
  );
}
