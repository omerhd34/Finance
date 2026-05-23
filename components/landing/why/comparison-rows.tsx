import { cn } from "@/lib/common/utils";
import { ComparisonBox } from "@/components/landing/why/comparison-box";

type ComparisonRowsProps = {
  positive?: string;
  positives?: readonly string[];
  negative?: string;
  negatives?: readonly string[];
  wide?: boolean;
  className?: string;
};

export function ComparisonRows({
  positive,
  positives,
  negative,
  negatives,
  wide = false,
  className,
}: ComparisonRowsProps) {
  const positiveItems = positives ?? (positive ? [positive] : []);
  const negativeItems = negatives ?? (negative ? [negative] : []);

  const hasPos = positiveItems.length > 0;
  const hasNeg = negativeItems.length > 0;

  if (!hasPos && !hasNeg) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid min-h-0 w-full flex-1 grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-border/45 bg-muted/20",
        wide && "lg:grid-cols-2",
        hasPos && hasNeg && "lg:grid-cols-2",
        className,
      )}
    >
      {hasPos ? (
        <div
          className={cn(
            "flex min-h-0 flex-col gap-3 border-border/40 p-4 sm:p-5",
            hasNeg && "border-b lg:border-b-0 lg:border-r",
            "bg-linear-to-b from-emerald-500/6 to-transparent dark:from-emerald-400/5",
          )}
        >
          <p className="text-[10px] font-semibold  tracking-[0.2em] text-emerald-600/90 dark:text-emerald-400/90">
            IQfinansAI
          </p>
          <ul className="flex min-h-0 flex-col gap-3">
            {positiveItems.map((text) => (
              <li key={text} className="min-w-0">
                <ComparisonBox positive text={text} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {hasNeg ? (
        <div
          className={cn(
            "flex min-h-0 flex-col gap-3 p-4 sm:p-5",
            "bg-linear-to-b from-rose-500/4 to-transparent dark:from-rose-400/5",
          )}
        >
          <p className="text-[10px] font-semibold tracking-[0.2em] text-rose-600/80 dark:text-rose-400/75">
            Dağınık süreçte
          </p>
          <ul className="flex min-h-0 flex-col gap-3">
            {negativeItems.map((text) => (
              <li key={text} className="min-w-0">
                <ComparisonBox positive={false} text={text} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
