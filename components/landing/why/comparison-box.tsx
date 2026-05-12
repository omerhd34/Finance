import { Check, X } from "lucide-react";
import { cn } from "@/lib/common/utils";

type ComparisonBoxProps = {
  positive: boolean;
  text: string;
};

export function ComparisonBox({ positive, text }: ComparisonBoxProps) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={cn(
          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full",
          positive ? "bg-emerald-500/15" : "bg-red-500/12",
        )}
      >
        {positive ? (
          <Check className="h-3 w-3 text-emerald-500" aria-hidden />
        ) : (
          <X className="h-3 w-3 text-red-500" aria-hidden />
        )}
      </span>
      <p
        className={cn(
          "text-[13px] leading-[1.55]",
          positive ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {text}
      </p>
    </div>
  );
}
