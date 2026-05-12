import type { LandingWhyHighlightCard } from "@/components/landing/why/content";
import { ComparisonRows } from "@/components/landing/why/comparison-rows";
import { WhyCardShell } from "@/components/landing/why/why-card-shell";

type WhyHighlightCardProps = {
  card: LandingWhyHighlightCard;
};

export function WhyHighlightCard({ card }: WhyHighlightCardProps) {
  return (
    <WhyCardShell card={card}>
      <ComparisonRows positives={card.positives} negative={card.negative} />
    </WhyCardShell>
  );
}
