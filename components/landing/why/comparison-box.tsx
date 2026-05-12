import { Check, X } from "lucide-react";
import { cn } from "@/lib/common/utils";

type ComparisonBoxProps = {
  positive: boolean;
  text: string;
};

export function ComparisonBox({ positive, text }: ComparisonBoxProps) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
          positive
            ? "border-emerald-500/25 bg-emerald-500/10 dark:border-emerald-400/30 dark:bg-emerald-400/10"
            : "border-rose-500/20 bg-rose-500/8 dark:border-rose-400/25 dark:bg-rose-400/8",
        )}
      >
        {positive ? (
          <Check
            className="h-3 w-3 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
        ) : (
          <X className="h-3 w-3 text-rose-600 dark:text-rose-400" aria-hidden />
        )}
      </span>
      <p
        className={cn(
          "min-w-0 text-[13px] leading-relaxed",
          positive ? "text-foreground/95" : "text-muted-foreground",
        )}
      >
        {text}
      </p>
    </div>
  );
}
