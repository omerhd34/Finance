import { cn, formatMoneyAmount } from "@/lib/common/utils";

export type InvestmentAggregate = {
  count: number;
  costTry: number;
  valueTry: number;
  pnlTry: number;
};

export function InvestmentPositionStats({
  summary,
  currency,
}: {
  summary: InvestmentAggregate;
  currency: string;
}) {
  const { count, costTry, valueTry, pnlTry } = summary;
  const pnlUp = pnlTry > 0;
  const pnlDown = pnlTry < 0;

  const valueClass =
    "mt-2.5 w-full min-w-0 max-w-full text-right text-xl font-semibold tabular-nums leading-snug tracking-tight wrap-break-word [overflow-wrap:anywhere]";

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:gap-4">
      <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-4 shadow-sm ring-1 ring-black/4 dark:ring-white/6 sm:p-4">
        <p className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Kayıt sayısı
        </p>
        <p className={cn(valueClass, "text-foreground")}>{count}</p>
      </div>
      <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-4 shadow-sm ring-1 ring-black/4 dark:ring-white/6 sm:p-4">
        <p className="flex flex-wrap items-center gap-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>Toplam maliyet</span>
        </p>
        <p className={cn(valueClass, "text-foreground")}>
          {formatMoneyAmount(costTry, currency)}
        </p>
      </div>
      <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-4 shadow-sm ring-1 ring-black/4 dark:ring-white/6 sm:p-4">
        <p className="flex flex-wrap items-center gap-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>Güncel değer</span>
        </p>
        <p className={cn(valueClass, "text-foreground")}>
          {formatMoneyAmount(valueTry, currency)}
        </p>
      </div>
      <div
        className={cn(
          "flex min-w-0 flex-col overflow-hidden rounded-xl border p-4 shadow-sm ring-1 sm:p-4",
          pnlUp &&
            "border-emerald-500/30 bg-linear-to-r from-emerald-500/12 via-emerald-500/6 to-card ring-emerald-500/15 dark:from-emerald-500/18 dark:via-emerald-500/8 dark:to-card",
          pnlDown &&
            "border-rose-500/30 bg-linear-to-r from-rose-500/12 via-rose-500/6 to-card ring-rose-500/15 dark:from-rose-500/18 dark:via-rose-500/8 dark:to-card",
          !pnlUp &&
            !pnlDown &&
            "border-border/50 bg-muted/20 ring-black/4 dark:ring-white/6",
        )}
      >
        <p className="flex flex-wrap items-center gap-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>Kar / Zarar</span>
        </p>
        <p
          className={cn(
            valueClass,
            pnlUp && "text-emerald-600 dark:text-emerald-400",
            pnlDown && "text-rose-600 dark:text-rose-400",
            !pnlUp && !pnlDown && "text-foreground",
          )}
        >
          {pnlUp ? "+" : ""}
          {formatMoneyAmount(pnlTry, currency)}
        </p>
      </div>
    </div>
  );
}
