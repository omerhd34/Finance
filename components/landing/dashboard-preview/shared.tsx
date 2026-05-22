import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/common/utils";

export function formatTL(value: number): string {
  const hasFraction = value % 1 !== 0;
  return `₺${value.toLocaleString("tr-TR", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function PreviewSectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 border-b border-border/60 px-3 py-3 sm:px-4 sm:py-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-400">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-tight text-foreground sm:text-sm">
          {title}
        </p>
        {description ? (
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function PreviewPageHeader({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  badge?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        {Icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-400">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-tight text-foreground sm:text-lg">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-xs leading-snug text-muted-foreground sm:text-[13px]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {badge ? <div className="shrink-0">{badge}</div> : null}
    </div>
  );
}

export function PreviewCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border border-border/60 bg-card shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PreviewBadge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  children: ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
      : tone === "warning"
        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
        : tone === "danger"
          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
          : tone === "info"
            ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
            : "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]",
        toneClass,
      )}
    >
      {children}
    </span>
  );
}

export function PreviewProgressBar({
  value,
  tone = "success",
}: {
  value: number;
  tone?: "success" | "warning" | "danger" | "info";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const fillClass =
    tone === "warning"
      ? "bg-amber-500"
      : tone === "danger"
        ? "bg-rose-500"
        : tone === "info"
          ? "bg-sky-500"
          : "bg-emerald-500";

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full", fillClass)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function PreviewDisabledButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled
      className={cn(
        "inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-500/25 sm:text-[11px] dark:text-emerald-300",
        className,
      )}
    >
      {children}
    </button>
  );
}
