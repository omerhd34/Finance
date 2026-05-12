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
        "flex flex-1 flex-col gap-2.5",
        wide && "md:grid md:grid-cols-2 md:gap-3",
        className,
      )}
    >
      {positiveItems.length > 0 ? (
        <div className="flex flex-1 flex-col justify-center space-y-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-3.5">
          {positiveItems.map((text) => (
            <ComparisonBox key={text} positive text={text} />
          ))}
        </div>
      ) : null}
      {negativeItems.length > 0 ? (
        <div className="flex flex-col justify-center space-y-2.5 rounded-xl border border-red-500/20 bg-red-500/6 p-3.5">
          {negativeItems.map((text) => (
            <ComparisonBox key={text} positive={false} text={text} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
