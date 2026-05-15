import type { LandingWhyCard } from "@/components/landing/why/content";
import { ComparisonRows } from "@/components/landing/why/comparison-rows";
import { WhyCardShell } from "@/components/landing/why/why-card-shell";

type WhyCardProps = {
  card: LandingWhyCard;
  className?: string;
};

export function WhyCard({ card, className }: WhyCardProps) {
  return (
    <WhyCardShell card={card} className={className}>
      <ComparisonRows positives={card.positives} negatives={card.negatives} />
    </WhyCardShell>
  );
}
