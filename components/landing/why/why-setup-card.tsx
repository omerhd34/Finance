import { CircleCheck } from "lucide-react";
import type { LandingWhySetupCard } from "@/components/landing/why/content";
import { cn } from "@/lib/common/utils";
import { ComparisonRows } from "@/components/landing/why/comparison-rows";
import { WhyCardShell } from "@/components/landing/why/why-card-shell";

type WhySetupCardProps = {
  card: LandingWhySetupCard;
};

export function WhySetupCard({ card }: WhySetupCardProps) {
  return (
    <WhyCardShell card={card} alignContent="start" className="h-auto">
      <div className="mb-4 space-y-3 rounded-xl border border-border/70 bg-muted/25 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">
            {card.processLabel}
          </span>
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            {card.processValue}
          </span>
        </div>
        <div className="space-y-4">
          {card.steps.map((step) => (
            <div key={step.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {step.label}
                </span>
                {step.done ? (
                  <CircleCheck
                    className="h-4 w-4 text-emerald-500"
                    aria-hidden
                  />
                ) : null}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    step.done
                      ? "bg-emerald-500"
                      : "bg-linear-to-r from-sky-500 to-emerald-500",
                  )}
                  style={{ width: `${step.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <ComparisonRows positive={card.positive} negative={card.negative} />
    </WhyCardShell>
  );
}
