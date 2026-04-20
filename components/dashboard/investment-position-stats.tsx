import { cn, formatMoneyAmount } from "@/lib/utils";

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

  return (
    <div className="grid min-w-0 grid-cols-2 gap-2.5 lg:gap-3 2xl:grid-cols-4">
      <div className="min-w-0 rounded-xl border border-border/50 bg-muted/20 p-3 shadow-sm ring-1 ring-black/4 dark:ring-white/6 sm:p-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Kayıt sayısı
        </p>
        <p className="mt-2 min-w-0 text-xl font-semibold tabular-nums leading-snug tracking-tight 2xl:text-sm 2xl:leading-tight">
          {count}
        </p>
      </div>
      <div className="min-w-0 rounded-xl border border-border/50 bg-muted/20 p-3 shadow-sm ring-1 ring-black/4 dark:ring-white/6 sm:p-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Toplam maliyet
        </p>
        <p className="mt-2 min-w-0 wrap-break-word text-xl font-semibold tabular-nums leading-snug tracking-tight 2xl:text-sm 2xl:leading-tight">
          {formatMoneyAmount(costTry, currency)}
        </p>
      </div>
      <div className="min-w-0 rounded-xl border border-border/50 bg-muted/20 p-3 shadow-sm ring-1 ring-black/4 dark:ring-white/6 sm:p-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Güncel değer
        </p>
        <p className="mt-2 min-w-0 wrap-break-word text-xl font-semibold tabular-nums leading-snug tracking-tight 2xl:text-sm 2xl:leading-tight">
          {formatMoneyAmount(valueTry, currency)}
        </p>
      </div>
      <div
        className={cn(
          "min-w-0 rounded-xl border p-3 shadow-sm ring-1 sm:p-3.5",
          pnlUp &&
            "border-emerald-500/30 bg-emerald-500/[0.07] ring-emerald-500/15 dark:bg-emerald-500/10",
          pnlDown &&
            "border-rose-500/30 bg-rose-500/[0.07] ring-rose-500/15 dark:bg-rose-500/10",
          !pnlUp &&
            !pnlDown &&
            "border-border/50 bg-muted/20 ring-black/4 dark:ring-white/6",
        )}
      >
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Kar / Zarar
        </p>
        <p
          className={cn(
            "mt-2 min-w-0 wrap-break-word text-xl font-semibold tabular-nums leading-snug tracking-tight 2xl:text-sm 2xl:leading-tight",
            pnlUp && "text-emerald-600 dark:text-emerald-400",
            pnlDown && "text-rose-600 dark:text-rose-400",
          )}
        >
          {pnlUp ? "+" : ""}
          {formatMoneyAmount(pnlTry, currency)}
        </p>
      </div>
    </div>
  );
}
