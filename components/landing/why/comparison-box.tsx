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
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          positive ? "bg-emerald-500/15" : "bg-red-500/15",
        )}
      >
        {positive ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
        ) : (
          <X className="h-3.5 w-3.5 text-red-500" aria-hidden />
        )}
      </span>
      <p
        className={cn(
          "text-sm leading-relaxed",
          positive ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {text}
      </p>
    </div>
  );
}
