"use client";

import Link from "next/link";
import { ArrowUpRight, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      <div className="flex flex-col gap-4 border-b border-border bg-muted/30 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6 sm:py-6">
        <div className="flex min-w-0 gap-3.5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15"
            aria-hidden
          >
            <LineChart className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 space-y-1.5 pt-0.5">
            <h3 className="flex flex-wrap items-center gap-2 text-lg font-semibold leading-tight tracking-tight">
              <span>Yatırım özeti</span>
            </h3>
            <p className="text-sm leading-snug text-muted-foreground">
              Pozisyon türlerine göre tahmini kar/zarar dağılımı
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full shrink-0 gap-1.5 sm:w-auto"
          asChild
        >
          <Link
            href="/yatirimlar"
            className="flex w-full items-center justify-center gap-1.5 sm:inline-flex sm:w-auto"
          >
            Yatırımlar
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </Link>
        </Button>
      </div>
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
