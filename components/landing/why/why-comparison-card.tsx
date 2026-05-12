import type { LandingWhyComparisonCard } from "@/components/landing/why/content";
import { ComparisonRows } from "@/components/landing/why/comparison-rows";
import { WhyCardShell } from "@/components/landing/why/why-card-shell";

type WhyComparisonCardProps = {
  card: LandingWhyComparisonCard;
};

export function WhyComparisonCard({ card }: WhyComparisonCardProps) {
  const isWide = card.layout === "wide";

  return (
    <WhyCardShell card={card} alignContent="fill">
      <ComparisonRows
        positives={card.positives}
        negatives={card.negatives}
        wide={isWide}
      />
    </WhyCardShell>
  );
}
