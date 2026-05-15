"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LANDING_WHY_CARDS } from "@/components/landing/why/content";
import { WhyCard } from "@/components/landing/why/why-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/common/utils";

export function WhyGridCarousel() {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const total = LANDING_WHY_CARDS.length;
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swipePointerId = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + total) % total);
    },
    [total],
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
    if (reduceMotion || total <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [reduceMotion, total]);

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
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {LANDING_WHY_CARDS.map((card) => (
            <div key={card.id} className="w-full shrink-0 px-0.5">
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
            aria-label="Önceki kart"
            onClick={() => go(-1)}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <div className="flex items-center gap-2">
            {LANDING_WHY_CARDS.map((card, i) => (
              <button
                key={card.id}
                type="button"
                className={cn(
                  "h-2 shrink-0 rounded-full transition-all",
                  i === index
                    ? "w-6 bg-emerald-500 dark:bg-emerald-400"
                    : "w-2 bg-muted-foreground/35 hover:bg-muted-foreground/55",
                )}
                aria-label={`${card.title} — slayt ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Sonraki kart"
            onClick={() => go(1)}
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
