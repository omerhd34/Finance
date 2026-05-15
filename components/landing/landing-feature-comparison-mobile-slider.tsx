"use client";

import { useEffect, useRef, useState } from "react";
import { useCarouselViewportMaxHeight } from "@/hooks/use-carousel-viewport-max-height";
import { LANDING_FEATURES } from "@/components/landing/landing-content";
import { MobileComparisonCard } from "@/components/landing/landing-feature-comparison-shared";
import { LandingCarouselNavCluster } from "@/components/landing/landing-carousel-nav-cluster";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export function LandingFeatureComparisonMobileSlider() {
  const [api, setApi] = useState<CarouselApi>();
  const [slideIndex, setSlideIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideCount = LANDING_FEATURES.length;

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
    const onSelect = () => setSlideIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (reduceMotion || slideCount <= 1 || !api) return;
    const t = window.setInterval(() => {
      api.scrollNext();
    }, 10_000);
    return () => window.clearInterval(t);
  }, [reduceMotion, slideCount, api]);

  return (
    <Carousel
      className="w-full min-w-0"
      opts={{ loop: true, align: "start", duration: 22 }}
      setApi={setApi}
      aria-label="Özellik karşılaştırması"
    >
      <CarouselContent viewportRef={viewportRef} className="-ml-2">
        {LANDING_FEATURES.map((feature) => {
          const Icon = feature.icon;
          const isPremiumOnly = feature.premium === true;
          return (
            <CarouselItem key={feature.title} className="basis-full pl-2">
              <MobileComparisonCard
                className="flex min-h-0 h-full flex-1 flex-col"
                title={feature.title}
                description={feature.description}
                Icon={Icon}
                freeAvailable={!isPremiumOnly}
                premiumAvailable
              />
            </CarouselItem>
          );
        })}
      </CarouselContent>

      <LandingCarouselNavCluster
        current={slideIndex + 1}
        total={slideCount}
        previousAriaLabel="Önceki slayt"
        nextAriaLabel="Sonraki slayt"
      />
    </Carousel>
  );
}
