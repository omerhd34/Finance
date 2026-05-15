import type { LucideIcon } from "lucide-react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/common/utils";

export const planColumnCellClass = "bg-emerald-500/5";

export function FeatureAvailability({ available }: { available: boolean }) {
  return (
    <div className="flex items-center justify-center">
      {available ? (
        <>
          <Check className="h-5 w-5 text-emerald-400" aria-hidden />
          <span className="sr-only">Dahil</span>
        </>
      ) : (
        <>
          <X className="h-5 w-5 text-red-500" aria-hidden />
          <span className="sr-only">Dahil değil</span>
        </>
      )}
    </div>
  );
}

export function MobileComparisonCard({
  title,
  description,
  Icon,
  freeAvailable,
  premiumAvailable,
  className,
}: {
  title: string;
  description: string;
  Icon: LucideIcon;
  freeAvailable: boolean;
  premiumAvailable: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border/70 bg-card/90 p-3.5 ring-1 ring-border/40 sm:p-4",
        planColumnCellClass,
        className,
      )}
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/15 to-emerald-600/5 ring-1 ring-emerald-500/20">
          <Icon className="h-5 w-5 text-emerald-400" aria-hidden />
        </div>
        <div className="min-w-0 space-y-2">
          <h3 className="text-base font-semibold leading-snug text-foreground">
            {title}
          </h3>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-border/50 bg-muted/20 p-2">
        <div className="flex flex-col items-center gap-1 rounded-md bg-background/60 px-2 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Ücretsiz
          </span>
          <FeatureAvailability available={freeAvailable} />
        </div>
        <div
          className={cn(
            "flex flex-col items-center gap-1 rounded-md px-2 py-2",
            planColumnCellClass,
          )}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Premium
          </span>
          <FeatureAvailability available={premiumAvailable} />
        </div>
      </div>
    </article>
  );
}
