"use client";

import {
  LANDING_SHOWCASE_BOTTOM_ROW,
  LANDING_SHOWCASE_TOP_ROW,
} from "@/components/landing/landing-content";
import type { LandingShowcaseTile } from "@/components/landing/landing-content";
import { cn } from "@/lib/common/utils";

type ShowcaseTone = LandingShowcaseTile["tone"];

const toneStyles: Record<ShowcaseTone, { icon: string; surface: string }> = {
  emerald: {
    icon: "text-emerald-600 dark:text-emerald-300",
    surface: "bg-emerald-500/12 ring-emerald-500/20",
  },
  sky: {
    icon: "text-sky-600 dark:text-sky-300",
    surface: "bg-sky-500/12 ring-sky-500/20",
  },
  rose: {
    icon: "text-rose-600 dark:text-rose-300",
    surface: "bg-rose-500/12 ring-rose-500/20",
  },
  amber: {
    icon: "text-amber-600 dark:text-amber-300",
    surface: "bg-amber-500/12 ring-amber-500/20",
  },
  violet: {
    icon: "text-violet-600 dark:text-violet-300",
    surface: "bg-violet-500/12 ring-violet-500/20",
  },
  cyan: {
    icon: "text-cyan-600 dark:text-cyan-300",
    surface: "bg-cyan-500/12 ring-cyan-500/20",
  },
  orange: {
    icon: "text-orange-600 dark:text-orange-300",
    surface: "bg-orange-500/12 ring-orange-500/20",
  },
  fuchsia: {
    icon: "text-fuchsia-600 dark:text-fuchsia-300",
    surface: "bg-fuchsia-500/12 ring-fuchsia-500/20",
  },
};

type MarqueeRowProps = {
  tiles: LandingShowcaseTile[];
  direction: "left" | "right";
  durationSeconds: number;
  offsetClassName?: string;
};

function ShowcaseTileCard({ tile }: { tile: LandingShowcaseTile }) {
  const Icon = tile.icon;
  const tone = toneStyles[tile.tone];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-sm transition-colors",
        tile.premium
          ? "border-amber-500/35 bg-amber-500/10 ring-1 ring-amber-500/20 dark:border-amber-400/35 dark:bg-amber-400/12 dark:ring-amber-400/25"
          : "border-border/80 bg-card/95",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
          tone.surface,
        )}
      >
        <Icon className={cn("h-5 w-5", tone.icon)} aria-hidden />
      </div>
      <p className="whitespace-nowrap text-sm font-semibold text-foreground md:text-[15px]">
        {tile.title}
      </p>
    </div>
  );
}

function MarqueeRow({
  tiles,
  direction,
  durationSeconds,
  offsetClassName,
}: MarqueeRowProps) {
  const loop = [...tiles, ...tiles];

  return (
    <div className={cn("relative overflow-hidden", offsetClassName)}>
      <div
        className={cn(
          "flex w-max gap-3 md:gap-4",
          direction === "left"
            ? "animate-landing-showcase-marquee-left"
            : "animate-landing-showcase-marquee-right",
        )}
        style={{ animationDuration: `${durationSeconds}s` }}
        aria-hidden
      >
        {loop.map((tile, index) => (
          <ShowcaseTileCard key={`${tile.title}-${index}`} tile={tile} />
        ))}
      </div>
    </div>
  );
}

export function LandingProductShowcaseMarquee() {
  const topRow = LANDING_SHOWCASE_TOP_ROW;
  const bottomRow = LANDING_SHOWCASE_BOTTOM_ROW;

  return (
    <div
      className="landing-showcase-mask relative mt-12 space-y-3 md:mt-14 md:space-y-4"
      aria-label="Öne çıkan ürün özellikleri"
    >
      <MarqueeRow tiles={topRow} direction="left" durationSeconds={42} />
      <MarqueeRow
        tiles={bottomRow}
        direction="right"
        durationSeconds={48}
        offsetClassName="md:pl-16"
      />
    </div>
  );
}
