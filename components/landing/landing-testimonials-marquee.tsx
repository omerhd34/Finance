"use client";

import { Quote } from "lucide-react";
import { LANDING_TESTIMONIALS } from "@/components/landing/landing-content";
import type { LandingTestimonial } from "@/components/landing/landing-content";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

function TestimonialCard({ testimonial }: { testimonial: LandingTestimonial }) {
  const index = getTestimonialIndex(testimonial);

  return (
    <figure className="flex w-full shrink-0 flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-sm ring-1 ring-border/40">
      {index % 3 !== 2 ? (
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
    <div className={cn("relative h-full overflow-hidden", offsetClassName)}>
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

export function LandingTestimonialsMarquee() {
  return (
    <div
      className="landing-testimonials-mask relative mt-12 h-100 overflow-hidden md:mt-14 md:h-144"
      aria-label="Kullanıcı yorumları"
    >
      <div className="grid h-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        <TestimonialsVerticalColumn
          testimonials={testimonialColumns[0]}
          direction="up"
          durationSeconds={46}
        />
        <TestimonialsVerticalColumn
          testimonials={testimonialColumns[1]}
          direction="down"
          durationSeconds={54}
          offsetClassName="md:pt-14"
        />
        <TestimonialsVerticalColumn
          testimonials={testimonialColumns[2]}
          direction="up"
          durationSeconds={50}
          offsetClassName="hidden sm:block md:pt-8"
        />
      </div>
    </div>
  );
}
