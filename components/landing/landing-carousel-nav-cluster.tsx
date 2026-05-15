"use client";

import { CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/common/utils";

const NAV_ICON_BTN =
  "static inset-auto top-auto right-auto left-auto size-8 shrink-0 translate-none rounded-full border-0 shadow-none hover:bg-muted/70 hover:text-foreground disabled:opacity-35";

type LandingCarouselNavClusterProps = {
  current: number;
  total: number;
  previousAriaLabel?: string;
  nextAriaLabel?: string;
  className?: string;
};

export function LandingCarouselNavCluster({
  current,
  total,
  previousAriaLabel,
  nextAriaLabel,
  className,
}: LandingCarouselNavClusterProps) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(1, current), safeTotal);

  return (
    <div className={cn("mt-5 flex w-full justify-center sm:mt-6", className)}>
      <div
        role="toolbar"
        aria-label="Slayt gezinmesi"
        className="inline-flex items-center gap-0.5 rounded-full border border-zinc-950/18 bg-muted/45 px-1 py-1 shadow-sm dark:border-zinc-600/55 dark:bg-muted/12 dark:shadow-none"
      >
        <CarouselPrevious
          variant="ghost"
          size="icon"
          className={NAV_ICON_BTN}
          aria-label={previousAriaLabel}
        />
        <output
          className="min-w-12 px-2 text-center tabular-nums text-[13px] text-muted-foreground sm:text-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="font-semibold text-foreground">{safeCurrent}</span>
          <span className="text-muted-foreground/65">/</span>
          <span>{safeTotal}</span>
        </output>
        <CarouselNext
          variant="ghost"
          size="icon"
          className={NAV_ICON_BTN}
          aria-label={nextAriaLabel}
        />
      </div>
    </div>
  );
}
