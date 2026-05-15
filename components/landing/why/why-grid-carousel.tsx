"use client";

import { useEffect, useRef, useState } from "react";
import { useCarouselViewportMaxHeight } from "@/hooks/use-carousel-viewport-max-height";
import { LANDING_WHY_CARDS } from "@/components/landing/why/content";
import { WhyCard } from "@/components/landing/why/why-card";
import { LandingCarouselNavCluster } from "@/components/landing/landing-carousel-nav-cluster";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/common/utils";

const WHY_CAROUSEL_AUTOPLAY_MS = {
  sm: 10_000,
  md: 15_000,
} as const;

function useWhyCarouselPerView(): { perView: 1 | 2; autoplayMs: number } {
  const [perView, setPerView] = useState<1 | 2>(1);
  const [autoplayMs, setAutoplayMs] = useState<number>(
    WHY_CAROUSEL_AUTOPLAY_MS.sm,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => {
      const isMd = mq.matches;
      setPerView(isMd ? 2 : 1);
      setAutoplayMs(
        isMd ? WHY_CAROUSEL_AUTOPLAY_MS.md : WHY_CAROUSEL_AUTOPLAY_MS.sm,
      );
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return { perView, autoplayMs };
}

export function WhyGridCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [snapIndex, setSnapIndex] = useState(0);
  const [snapTotal, setSnapTotal] = useState(1);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { perView, autoplayMs } = useWhyCarouselPerView();
  const slideCount = LANDING_WHY_CARDS.length;
  const viewportRef = useRef<HTMLDivElement>(null);

  useCarouselViewportMaxHeight(api, viewportRef);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!api) return;
    const syncSnaps = () => {
      setSnapIndex(api.selectedScrollSnap());
      setSnapTotal(Math.max(1, api.scrollSnapList().length));
    };
    syncSnaps();
    api.on("select", syncSnaps);
    api.on("reInit", syncSnaps);
    return () => {
      api.off("select", syncSnaps);
      api.off("reInit", syncSnaps);
    };
  }, [api]);

  useEffect(() => {
    if (reduceMotion || slideCount <= 1 || !api) return;
    const timer = window.setInterval(() => {
      api.scrollNext();
    }, autoplayMs);
    return () => window.clearInterval(timer);
  }, [reduceMotion, slideCount, autoplayMs, api]);

  return (
    <Carousel
      key={perView}
      className="relative w-full"
      opts={{
        loop: true,
        align: "start",
        duration: 22,
      }}
      setApi={setApi}
      aria-label="IQfinansAI avantajları"
    >
      <CarouselContent viewportRef={viewportRef} className="-ml-2 md:-ml-3">
        {LANDING_WHY_CARDS.map((card) => (
          <CarouselItem
            key={card.id}
            className={cn(
              "pl-2 md:pl-3",
              perView === 2 ? "basis-full md:basis-1/2" : "basis-full",
            )}
          >
            <WhyCard card={card} className="min-h-0 flex-1 flex-col" />
          </CarouselItem>
        ))}
      </CarouselContent>

      <LandingCarouselNavCluster
        className="mt-3 sm:mt-6"
        current={snapIndex + 1}
        total={snapTotal}
        previousAriaLabel="Önceki slayt"
        nextAriaLabel="Sonraki slayt"
      />
    </Carousel>
  );
}
