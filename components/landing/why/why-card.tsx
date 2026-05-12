import type { LandingWhyCard } from "@/components/landing/why/content";
import { WhyComparisonCard } from "@/components/landing/why/why-comparison-card";
import { WhyHighlightCard } from "@/components/landing/why/why-highlight-card";
import { WhySetupCard } from "@/components/landing/why/why-setup-card";

type WhyCardProps = {
  card: LandingWhyCard;
};

export function WhyCard({ card }: WhyCardProps) {
  if (card.kind === "highlight") {
    return <WhyHighlightCard card={card} />;
  }

  if (card.kind === "setup") {
    return <WhySetupCard card={card} />;
  }

  return <WhyComparisonCard card={card} />;
}
