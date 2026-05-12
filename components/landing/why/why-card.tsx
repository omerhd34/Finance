import type { LandingWhyCard } from "@/components/landing/why/content";
import { ComparisonRows } from "@/components/landing/why/comparison-rows";
import { WhyCardShell } from "@/components/landing/why/why-card-shell";

type WhyCardProps = {
  card: LandingWhyCard;
};

export function WhyCard({ card }: WhyCardProps) {
  return (
    <WhyCardShell card={card}>
      <ComparisonRows positives={card.positives} negatives={card.negatives} />
    </WhyCardShell>
  );
}
