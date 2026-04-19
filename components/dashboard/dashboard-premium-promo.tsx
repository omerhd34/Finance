"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PREMIUM_PRICE_TRY } from "@/lib/premium-price";
import { cn } from "@/lib/utils";

export function DashboardPremiumPromo() {
  return (
    <section
      aria-label="Premium üyelik tanıtımı"
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-emerald-500/35 bg-linear-to-br from-emerald-500/12 via-card to-card p-5 shadow-md shadow-emerald-950/20 ring-1 ring-emerald-500/25 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
      )}
    >
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/25">
            <Sparkles
              className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
              aria-hidden
            />
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Premium
          </span>
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          AI analiz ve yatırım takibini açın
        </h2>
        <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Kişiselleştirilmiş AI analizi, hisse ve altın yatırım takibi ve
          öncelikli yenilikler.
        </p>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 pt-0.5">
          <span
            aria-label={`Aylık ${PREMIUM_PRICE_TRY} Türk lirası`}
            className={cn(
              "inline-flex items-baseline gap-1.5 rounded-lg px-3 py-1.5",
              "bg-emerald-500/10 text-lg font-semibold leading-none tracking-tight text-foreground",
              "ring-1 ring-emerald-500/25 tabular-nums",
              "dark:bg-emerald-500/15",
            )}
          >
            <span className="text-base font-semibold">₺</span>
            <span>{PREMIUM_PRICE_TRY}</span>
            <span className="text-sm font-medium text-muted-foreground">
              / ay
            </span>
          </span>
        </div>
      </div>
      <Button
        asChild
        className="h-11 w-full shrink-0 rounded-full bg-emerald-500 px-6 text-base font-semibold text-black shadow-md shadow-emerald-900/35 transition hover:bg-emerald-400 hover:shadow-lg dark:text-white sm:w-auto sm:self-center"
      >
        <Link href="/settings">Premium satın al</Link>
      </Button>
    </section>
  );
}
