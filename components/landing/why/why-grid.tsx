import { LANDING_WHY_CARDS } from "@/components/landing/why/content";
import { cn } from "@/lib/common/utils";
import {
  gridSlotClasses,
  middleColumnCardIds,
} from "@/components/landing/why/constants";
import { WhyCard } from "@/components/landing/why/why-card";

export function WhyGrid() {
  return (
    <ul className="mt-14 grid w-full grid-cols-1 gap-3 md:grid-cols-3 md:items-stretch *:min-h-0">
      {LANDING_WHY_CARDS.map((card) => {
        if (card.id === "transaction-categories") {
          return null;
        }

        if (card.id === "budget-planning") {
          const middleColumnCards = LANDING_WHY_CARDS.filter((item) =>
            middleColumnCardIds.includes(
              item.id as (typeof middleColumnCardIds)[number],
            ),
          );

          return (
            <li
              key="middle-column"
              className="grid h-full min-h-0 grid-cols-1 grid-rows-2 gap-3 md:col-start-2 md:row-span-2 md:row-start-1"
            >
              {middleColumnCards.map((middleCard) => (
                <div
                  key={middleCard.id}
                  className="flex h-full min-h-0 min-w-0"
                >
                  <WhyCard card={middleCard} />
                </div>
              ))}
            </li>
          );
        }

        return (
          <li
            key={card.id}
            className={cn(
              "flex h-full min-h-0 min-w-0",
              gridSlotClasses[card.id],
            )}
          >
            <WhyCard card={card} />
          </li>
        );
      })}
    </ul>
  );
}
