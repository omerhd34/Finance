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

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        wide && "md:grid md:grid-cols-2 md:gap-4",
        className,
      )}
    >
      {positiveItems.length > 0 ? (
        <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          {positiveItems.map((text) => (
            <ComparisonBox key={text} positive text={text} />
          ))}
        </div>
      ) : null}
      {negativeItems.length > 0 ? (
        <div className="space-y-3 rounded-xl border border-red-500/25 bg-red-500/8 p-4">
          {negativeItems.map((text) => (
            <ComparisonBox key={text} positive={false} text={text} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
