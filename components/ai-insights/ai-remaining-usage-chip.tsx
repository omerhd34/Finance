"use client";

import { Loader2 } from "lucide-react";

type Props = {
  mode: "questions" | "analyses";
  remaining: number | null;
  loading?: boolean;
};

export function AiRemainingUsageChip({
  mode,
  remaining,
  loading = false,
}: Props) {
  const hasData = remaining != null;
  const label = mode === "questions" ? "soru" : "analiz";

  return (
    <div className="inline-flex h-9 min-w-[220px] items-center justify-center rounded-md border border-border/70 bg-card/60 px-3 text-sm text-muted-foreground shadow-sm">
      {loading && !hasData ? (
        <p className="flex items-center justify-center gap-2 text-center">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Kalan {label} hakkı yükleniyor...
        </p>
      ) : (
        <p className="text-center">
          Bugün kalan{" "}
          <span className="font-semibold text-foreground">
            {remaining ?? 0} {label}
          </span>
        </p>
      )}
    </div>
  );
}
