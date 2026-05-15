"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LANDING_WHY_CARDS } from "@/components/landing/why/content";
import { WhyCard } from "@/components/landing/why/why-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/common/utils";

const WHY_CAROUSEL_AUTOPLAY_MS = {
  sm: 10_000,
  md: 15_000,
} as const;

function useWhyCarouselLayout(): {
  perView: number;
  autoplayMs: number;
} {
  const [perView, setPerView] = useState(1);
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
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { perView, autoplayMs } = useWhyCarouselLayout();
  const total = LANDING_WHY_CARDS.length;
  const maxIndex = Math.max(0, total - perView);
  const slideIndex = Math.min(index, maxIndex);
  const slideCount = maxIndex + 1;
  const trackWidthPercent = (total / perView) * 100;
  const slideWidthPercent = 100 / total;
  const translatePercent = (slideIndex / total) * 100;
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swipePointerId = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        const next = i + delta;
        if (next < 0) return maxIndex;
        if (next > maxIndex) return 0;
        return next;
      });
    },
    [maxIndex],
  );

  const endSwipe = useCallback(
    (
      target: HTMLDivElement,
      pointerId: number,
      clientX: number,
      clientY: number,
    ) => {
      if (swipePointerId.current !== pointerId || !swipeStart.current) return;
      const dx = clientX - swipeStart.current.x;
      const dy = clientY - swipeStart.current.y;
      swipeStart.current = null;
      swipePointerId.current = null;
      try {
        target.releasePointerCapture(pointerId);
      } catch {
        // noop
      }
      if (Math.abs(dx) < Math.abs(dy)) return;
      const threshold = 40;
      if (dx > threshold) go(-1);
      else if (dx < -threshold) go(1);
    },
    [go],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduceMotion(mq.matches);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion || slideCount <= 1) return;
    const timer = window.setInterval(() => {
      go(1);
    }, autoplayMs);
    return () => window.clearInterval(timer);
  }, [reduceMotion, slideCount, go, autoplayMs]);

  return (
    <div
      className="relative w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="IQfinansAI avantajları"
    >
      <div
        className="touch-pan-y overflow-hidden"
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          swipeStart.current = { x: e.clientX, y: e.clientY };
          swipePointerId.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          endSwipe(e.currentTarget, e.pointerId, e.clientX, e.clientY);
        }}
        onPointerCancel={(e) => {
          if (swipePointerId.current !== e.pointerId || !swipeStart.current)
            return;
          swipeStart.current = null;
          swipePointerId.current = null;
          try {
            e.currentTarget.releasePointerCapture(e.pointerId);
          } catch {
            /* noop */
          }
        }}
      >
        <div
          className={cn(
            "flex",
            !reduceMotion &&
              "transition-transform duration-500 ease-out motion-reduce:transition-none",
          )}
          style={{
            width: `${trackWidthPercent}%`,
            transform: `translate3d(-${translatePercent}%, 0, 0)`,
          }}
        >
          {LANDING_WHY_CARDS.map((card) => (
            <div
              key={card.id}
              className="box-border shrink-0 px-2"
              style={{ width: `${slideWidthPercent}%` }}
            >
              <WhyCard card={card} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <div className="inline-flex w-fit max-w-full items-center gap-3 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Önceki slayt"
            onClick={() => go(-1)}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: slideCount }, (_, slide) => (
              <button
                key={slide}
                type="button"
                className={cn(
                  "h-2 shrink-0 rounded-full transition-all",
                  slide === slideIndex
                    ? "w-6 bg-emerald-500 dark:bg-emerald-400"
                    : "w-2 bg-muted-foreground/35 hover:bg-muted-foreground/55",
                )}
                aria-label={`${LANDING_WHY_CARDS[slide]?.title ?? "Kart"} — ${slide + 1} / ${slideCount}`}
                aria-current={slide === slideIndex ? "true" : undefined}
                onClick={() => setIndex(slide)}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Sonraki slayt"
            onClick={() => go(1)}
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
