import type { LandingWhyHighlightCard } from "@/components/landing/why/content";
import { ComparisonRows } from "@/components/landing/why/comparison-rows";
import { WhyCardShell } from "@/components/landing/why/why-card-shell";

type WhyHighlightCardProps = {
  card: LandingWhyHighlightCard;
};

export function WhyHighlightCard({ card }: WhyHighlightCardProps) {
  return (
    <WhyCardShell card={card} alignContent="start">
      <div className="mb-4 space-y-3 rounded-xl border border-border/70 bg-muted/25 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Verimlilik</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-300">
              %{card.efficiencyValue}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500"
              style={{ width: `${card.efficiencyValue}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {card.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/70 bg-card/80 px-2.5 py-3 text-center"
            >
              <p className="text-base font-bold text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
      <ComparisonRows positives={card.positives} negative={card.negative} />
    </WhyCardShell>
  );
}
