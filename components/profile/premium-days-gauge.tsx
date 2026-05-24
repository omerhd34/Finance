"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Sparkles } from "lucide-react";
import { cn } from "@/lib/common/utils";
import { PREMIUM_SUBSCRIPTION_DAYS } from "@/lib/premium/premium-subscription-constants";

const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;

type PremiumDaysGaugeProps = {
  premiumUntilIso: string | null;
  endFormatted: string | null;
};

type Remaining = {
  daysLeft: number;
  hoursLeft: number;
  ratio: number;
  expired: boolean;
};

function computeRemaining(
  premiumUntilIso: string | null,
  totalDays: number,
  nowMs: number,
): Remaining | null {
  if (!premiumUntilIso) return null;
  const end = new Date(premiumUntilIso);
  if (Number.isNaN(end.getTime())) return null;
  const diff = end.getTime() - nowMs;
  if (diff <= 0) {
    return { daysLeft: 0, hoursLeft: 0, ratio: 0, expired: true };
  }
  return {
    daysLeft: Math.ceil(diff / MS_PER_DAY),
    hoursLeft: Math.ceil(diff / MS_PER_HOUR),
    ratio: Math.min(1, diff / (totalDays * MS_PER_DAY)),
    expired: false,
  };
}

export function PremiumDaysGauge({
  premiumUntilIso,
  endFormatted,
}: PremiumDaysGaugeProps) {
  const totalDays = PREMIUM_SUBSCRIPTION_DAYS;
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const remaining = useMemo(
    () => computeRemaining(premiumUntilIso, totalDays, nowMs),
    [premiumUntilIso, totalDays, nowMs],
  );

  if (!remaining) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Premium bitiş tarihi yükleniyor…
      </div>
    );
  }

  const { daysLeft, hoursLeft, ratio, expired } = remaining;
  const pct = Math.max(0, Math.min(100, ratio * 100));

  const tone =
    expired || pct < 15 ? "danger" : pct < 33 ? "warning" : "success";

  const arcClass =
    tone === "success"
      ? "text-emerald-500"
      : tone === "warning"
        ? "text-amber-500"
        : "text-red-500";

  const showHours = !expired && daysLeft <= 1;
  const centerValue = expired
    ? "0"
    : showHours
      ? String(hoursLeft)
      : String(daysLeft);
  const centerLabel = expired
    ? "süre doldu"
    : showHours
      ? hoursLeft === 1
        ? "saat kaldı"
        : "saat kaldı"
      : daysLeft === 1
        ? "gün kaldı"
        : "gün kaldı";

  const arcPath = "M 20 100 A 80 80 0 0 1 180 100";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-[280px]">
        <svg
          viewBox="0 0 200 112"
          className="block h-auto w-full"
          aria-label={
            expired
              ? "Premium üyeliğiniz sona erdi."
              : `Premium üyeliğinizden ${daysLeft} gün kaldı.`
          }
          role="img"
        >
          <path
            d={arcPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={14}
            strokeLinecap="round"
            pathLength={100}
            className="text-muted-foreground/20"
          />
          <path
            d={arcPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={14}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${expired ? 0 : Math.max(0.5, pct)} 100`}
            className={cn(
              "transition-[stroke-dasharray] duration-500 ease-out",
              arcClass,
            )}
          />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center text-center">
          <span className="inline-flex items-baseline gap-1">
            <span
              className={cn(
                "text-4xl font-bold tabular-nums leading-none tracking-tight",
                tone === "success" && "text-foreground",
                tone === "warning" && "text-amber-600 dark:text-amber-400",
                tone === "danger" && "text-red-600 dark:text-red-400",
              )}
            >
              {centerValue}
            </span>
          </span>
          <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {centerLabel}
          </span>
        </div>
      </div>

      <div className="-mt-1 flex w-full max-w-[280px] justify-between px-2 text-[11px] tabular-nums text-muted-foreground">
        <span>0</span>
        <span>{totalDays} gün</span>
      </div>

      {endFormatted ? (
        <p
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
            tone === "success" &&
              "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            tone === "warning" &&
              "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
            tone === "danger" &&
              "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
          )}
        >
          {expired ? (
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <CalendarClock className="h-3.5 w-3.5" aria-hidden />
          )}
          <span>
            {expired
              ? "Premium süreniz sona erdi."
              : `${endFormatted}'de sona erecek.`}
          </span>
        </p>
      ) : null}
    </div>
  );
}
