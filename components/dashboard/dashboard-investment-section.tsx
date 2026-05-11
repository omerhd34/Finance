"use client";

import { LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardSectionActionLink } from "@/components/dashboard/dashboard-section-action-link";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { cn, formatMoneyAmount } from "@/lib/common/utils";

export type InvestmentPnlBreakdownRow = {
  label: string;
  pnlTry: number;
};

type Props = {
  currency: string;
  totalPnlTry: number;
  breakdown: InvestmentPnlBreakdownRow[];
};

function signedPnlText(amount: number, currency: string): string {
  if (amount > 0) {
    return `+${formatMoneyAmount(amount, currency)}`;
  }
  return formatMoneyAmount(amount, currency);
}

function pnlToneClass(amount: number): string {
  if (amount > 0) return "text-emerald-600 dark:text-emerald-400";
  if (amount < 0) return "text-rose-600 dark:text-rose-400";
  return "text-foreground";
}

function pnlRowSurfaceClass(amount: number): string {
  if (amount > 0) {
    return "bg-emerald-500/10 ring-1 ring-emerald-500/20 dark:bg-emerald-500/14 dark:ring-emerald-500/25";
  }
  if (amount < 0) {
    return "bg-rose-500/12 ring-1 ring-rose-500/25 dark:bg-rose-500/16 dark:ring-rose-500/30";
  }
  return "bg-muted/20 ring-1 ring-border/40";
}

export function DashboardInvestmentSection({
  currency,
  totalPnlTry,
  breakdown,
}: Props) {
  return (
    <Card className="min-w-0 overflow-hidden border-border/50 bg-linear-to-br from-card via-card to-muted/15 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      <DashboardSectionHeader
        icon={LineChart}
        iconStrokeWidth={2}
        title="Yatırım özeti"
        description="Pozisyon türlerine göre tahmini kar/zarar dağılımı"
        action={
          <DashboardSectionActionLink href="/yatirimlar" label="Yatırımlar" />
        }
      />
      <div className="min-w-0 p-4 sm:p-6">
        <div className="min-w-0 overflow-hidden rounded-xl border border-border/50 bg-muted/10 p-4 shadow-sm ring-1 ring-black/4 dark:bg-muted/5 dark:ring-white/6 sm:p-5">
          <ul className="flex flex-col gap-2">
            {breakdown.map((row) => (
              <li
                key={row.label}
                className={cn(
                  "flex min-w-0 items-baseline justify-between gap-4 rounded-lg px-3 py-3",
                  pnlRowSurfaceClass(row.pnlTry),
                )}
              >
                <span className="min-w-0 text-sm font-medium">{row.label}</span>
                <span
                  className={cn(
                    "shrink-0 text-right text-sm font-semibold tabular-nums tracking-tight",
                    pnlToneClass(row.pnlTry),
                  )}
                >
                  {signedPnlText(row.pnlTry, currency)}
                </span>
              </li>
            ))}
            <li
              className={cn(
                "mt-1 flex min-w-0 items-baseline justify-between gap-4 rounded-lg px-3 py-3",
                breakdown.length > 0 && "border-t border-border/60 pt-4",
                pnlRowSurfaceClass(totalPnlTry),
              )}
            >
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Toplam kar / zarar
              </span>
              <span
                className={cn(
                  "shrink-0 text-right text-sm font-semibold tabular-nums tracking-tight",
                  pnlToneClass(totalPnlTry),
                )}
              >
                {signedPnlText(totalPnlTry, currency)}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
