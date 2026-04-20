import { cn, currencySymbolLabel, formatMoneyAmount } from "@/lib/utils";

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
          Kayıt sayısı (Adet)
        </p>
        <p className={cn(valueClass, "text-foreground")}>{count}</p>
      </div>
      <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-4 shadow-sm ring-1 ring-black/4 dark:ring-white/6 sm:p-4">
        <p className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Toplam maliyet ({currencySymbolLabel(currency)})
        </p>
        <p className={cn(valueClass, "text-foreground")}>
          {formatMoneyAmount(costTry, currency)}
        </p>
      </div>
      <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-4 shadow-sm ring-1 ring-black/4 dark:ring-white/6 sm:p-4">
        <p className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Güncel değer ({currencySymbolLabel(currency)})
        </p>
        <p className={cn(valueClass, "text-foreground")}>
          {formatMoneyAmount(valueTry, currency)}
        </p>
      </div>
      <div
        className={cn(
          "flex min-w-0 flex-col overflow-hidden rounded-xl border p-4 shadow-sm ring-1 sm:p-4",
          pnlUp &&
            "border-emerald-500/30 bg-emerald-500/[0.07] ring-emerald-500/15 dark:bg-emerald-500/10",
          pnlDown &&
            "border-rose-500/30 bg-rose-500/[0.07] ring-rose-500/15 dark:bg-rose-500/10",
          !pnlUp &&
            !pnlDown &&
            "border-border/50 bg-muted/20 ring-black/4 dark:ring-white/6",
        )}
      >
        <p className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Kar / Zarar ({currencySymbolLabel(currency)})
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
