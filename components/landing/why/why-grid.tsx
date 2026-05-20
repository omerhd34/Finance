import { LANDING_WHY_CARDS } from "@/components/landing/why/content";
import { cn } from "@/lib/common/utils";
import { gridSlotClasses } from "@/components/landing/why/constants";
import { WhyCard } from "@/components/landing/why/why-card";
import { WhyGridCarousel } from "@/components/landing/why/why-grid-carousel";

export function WhyGrid() {
  return (
    <>
      <div className="mt-16 lg:hidden">
        <WhyGridCarousel />
      </div>
      <ul className="mt-16 hidden w-full grid-cols-1 gap-4 lg:grid lg:grid-cols-10 lg:grid-rows-4 lg:items-stretch lg:gap-5 *:min-h-0">
        {LANDING_WHY_CARDS.map((card) => (
          <li
            key={card.id}
            className={cn(
              "flex h-full min-h-0 min-w-0 w-full",
              gridSlotClasses[card.id],
            )}
          >
            <WhyCard card={card} />
          </li>
        ))}
      </ul>
    </>
  );
}
