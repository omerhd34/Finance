"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/common/utils";

type Props = {
  mode: "conversations" | "analyses";
  remaining: number | null;
  loading?: boolean;
  dense?: boolean;
};

export function AiRemainingUsageChip({
  mode,
  remaining,
  loading = false,
  dense = false,
}: Props) {
  const hasData = remaining != null;
  const label = mode === "conversations" ? "mesajlaşma" : "analiz";
  const count = remaining ?? 0;
  const title = `Bugün kalan ${String(count)} ${label}`;

  const squareFrame = cn(
    "flex aspect-square shrink-0 items-center justify-center rounded-md border border-border/70 bg-card/80 font-semibold tabular-nums text-foreground shadow-inner",
  );

  if (dense) {
    return (
      <div
        className={cn(
          squareFrame,
          "size-9 text-sm text-muted-foreground shadow-sm",
        )}
        title={title}
      >
        {loading && !hasData ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <span className="leading-none">{count}</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex h-9 min-w-[220px] items-center justify-center gap-2 rounded-md border border-border/70 bg-card/60 px-3 text-sm text-muted-foreground shadow-sm",
      )}
      title={title}
    >
      {loading && !hasData ? (
        <p className="flex items-center justify-center gap-2 text-center">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        </p>
      ) : (
        <p className="flex items-center gap-2">
          <span className={cn(squareFrame, "size-8 text-sm")}>{count}</span>
        </p>
      )}
    </div>
  );
}
