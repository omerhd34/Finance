"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LANDING_TESTIMONIALS } from "@/components/landing/landing-content";
import type { LandingTestimonial } from "@/components/landing/landing-content";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/common/utils";

const avatarTones = [
  "bg-emerald-500 text-white",
  "bg-violet-500 text-white",
  "bg-sky-500 text-white",
  "bg-fuchsia-500 text-white",
  "bg-amber-500 text-slate-950",
  "bg-cyan-500 text-white",
] as const;

const testimonialColumns = [
  LANDING_TESTIMONIALS.filter((_, index) => index % 3 === 0),
  LANDING_TESTIMONIALS.filter((_, index) => index % 3 === 1),
  LANDING_TESTIMONIALS.filter((_, index) => index % 3 === 2),
] as const;

function getInitials(name: string): string {
  const parts = name.replace(/\./g, "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1)
    return parts[0].slice(0, 2).toLocaleUpperCase("tr-TR");
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return `${first}${last}`.toLocaleUpperCase("tr-TR");
}

function getTestimonialIndex(testimonial: LandingTestimonial): number {
  return LANDING_TESTIMONIALS.findIndex((item) => item.id === testimonial.id);
}

function TestimonialCard({
  testimonial,
  alternateQuoteIcon = true,
}: {
  testimonial: LandingTestimonial;
  alternateQuoteIcon?: boolean;
}) {
  const index = getTestimonialIndex(testimonial);
  const showQuoteIcon = !alternateQuoteIcon || index % 3 !== 2;

  return (
    <figure className="flex w-full shrink-0 flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-sm ring-1 ring-border/40">
      {showQuoteIcon ? (
        <Quote
          className="h-7 w-7 shrink-0 text-emerald-500/45 dark:text-emerald-400/45"
          aria-hidden
        />
      ) : (
        <span className="block h-7" aria-hidden />
      )}
      <blockquote className="mt-4 text-pretty text-[15px] leading-7 text-muted-foreground">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <Avatar className="h-11 w-11">
          <AvatarFallback
            className={cn(
              "text-sm font-semibold",
              avatarTones[index % avatarTones.length],
            )}
          >
            {getInitials(testimonial.attribution)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {testimonial.attribution}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {testimonial.context}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {testimonial.profession}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

type VerticalColumnProps = {
  testimonials: readonly LandingTestimonial[];
  direction: "up" | "down";
  durationSeconds: number;
  offsetClassName?: string;
};

function TestimonialsVerticalColumn({
  testimonials,
  direction,
  durationSeconds,
  offsetClassName,
}: VerticalColumnProps) {
  const loop = [...testimonials, ...testimonials];

  return (
    <div
      className={cn("relative h-full min-h-0 overflow-hidden", offsetClassName)}
    >
      <div
        className={cn(
          "flex flex-col gap-6",
          direction === "up"
            ? "animate-landing-testimonials-marquee-up"
            : "animate-landing-testimonials-marquee-down",
        )}
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {loop.map((testimonial, index) => (
          <TestimonialCard
            key={`${testimonial.id}-${index}`}
            testimonial={testimonial}
          />
        ))}
      </div>
    </div>
  );
}

function TestimonialsMobileCarousel() {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const total = LANDING_TESTIMONIALS.length;
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
        /* capture zaten bırakılmış olabilir */
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
    }, 9000);
    return () => window.clearInterval(timer);
  }, [reduceMotion, total]);

  return (
    <div
      className="relative mx-auto mt-10 w-full max-w-lg md:hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Kullanıcı yorumları"
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
              "transition-transform duration-700 ease-out motion-reduce:transition-none",
          )}
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {LANDING_TESTIMONIALS.map((t) => (
            <div key={t.id} className="w-full shrink-0 px-0.5">
              <TestimonialCard testimonial={t} alternateQuoteIcon={false} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-8">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Önceki yorum"
          onClick={() => go(-1)}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Sonraki yorum"
          onClick={() => go(1)}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

export function LandingTestimonialsMarquee() {
  return (
    <>
      <TestimonialsMobileCarousel />
      <div
        className="landing-testimonials-mask relative mt-12 hidden h-100 overflow-hidden md:mt-14 md:block md:h-144"
        aria-label="Kullanıcı yorumları"
      >
        <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-3 xl:gap-8">
          <TestimonialsVerticalColumn
            testimonials={testimonialColumns[0]}
            direction="up"
            durationSeconds={46}
          />
          <TestimonialsVerticalColumn
            testimonials={testimonialColumns[1]}
            direction="down"
            durationSeconds={54}
            offsetClassName="xl:pt-14"
          />
          <div className="hidden min-h-0 xl:block">
            <TestimonialsVerticalColumn
              testimonials={testimonialColumns[2]}
              direction="up"
              durationSeconds={50}
              offsetClassName="xl:pt-8"
            />
          </div>
        </div>
      </div>
    </>
  );
}
