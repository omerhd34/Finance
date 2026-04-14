import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LandingPlan } from "./landing-content";
type Props = {
  plan: LandingPlan;
};

export function LandingPricingCard({ plan }: Props) {
  const isHighlight = plan.highlighted;

  const cardClass = cn(
    "flex h-full flex-col rounded-2xl",
    isHighlight
      ? "landing-pricing-card--featured"
      : "landing-card landing-card--interactive",
  );

  const ctaClass =
    plan.ctaVariant === "primary" ? "landing-cta-primary" : "landing-cta-muted";

  return (
    <Card className={cardClass}>
      <CardHeader className="space-y-1 pb-2 pt-8 sm:px-8">
        {isHighlight && (
          <span className="mb-2 inline-block w-fit rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            Önerilen
          </span>
        )}
        <CardTitle className="text-2xl text-white">{plan.title}</CardTitle>
        <CardDescription className="min-h-12 text-base leading-relaxed text-zinc-400">
          {plan.subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-8 pb-8">
        <p className="text-3xl font-bold tracking-tight text-white">
          {plan.priceMain}
          {plan.priceSuffix && (
            <span className="text-lg font-normal text-zinc-500">
              {plan.priceSuffix}
            </span>
          )}
          {plan.priceNote && (
            <span className="ml-2 text-lg font-normal text-zinc-500">
              {plan.priceNote}
            </span>
          )}
        </p>
        <ul className="my-6 space-y-3 text-sm leading-relaxed text-zinc-300">
          {plan.perks.map((line) => (
            <li key={line} className="flex gap-3">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                aria-hidden
              />
              {line}
            </li>
          ))}
        </ul>
        <Button
          asChild
          size="lg"
          className={cn("mt-auto w-full rounded-full font-semibold", ctaClass)}
        >
          <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
