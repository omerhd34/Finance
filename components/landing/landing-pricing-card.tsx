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
  const titleClass = "text-card-foreground";
  const subtitleClass = "text-muted-foreground";
  const priceClass = "text-card-foreground";
  const helperTextClass = "text-muted-foreground";
  const perksClass = "text-muted-foreground";

  const cardClass = cn(
    "flex h-full flex-col rounded-2xl",
    isHighlight
      ? "rounded-2xl border border-emerald-500/35 bg-linear-to-b from-emerald-500/12 to-card text-card-foreground shadow-lg ring-1 ring-emerald-500/25 backdrop-blur-sm transition-all duration-300 md:hover:shadow-xl md:hover:shadow-emerald-900/25"
      : "border border-border bg-card text-card-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/25 hover:shadow-lg",
  );

  const ctaClass =
    plan.ctaVariant === "primary"
      ? "bg-emerald-500 text-black shadow-md shadow-emerald-900/40 transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-900/50 dark:text-white"
      : "bg-foreground text-background transition hover:opacity-90";

  return (
    <Card className={cardClass}>
      <CardHeader className="space-y-1 pb-2 pt-8 sm:px-8">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <CardTitle className={cn("text-2xl", titleClass)}>
            {plan.title}
          </CardTitle>
          {isHighlight ? (
            <span className="inline-block w-fit shrink-0 rounded-full bg-emerald-500/15 ml-2 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
              Önerilen
            </span>
          ) : null}
        </div>
        <CardDescription
          className={cn("min-h-12 text-base leading-relaxed", subtitleClass)}
        >
          {plan.subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-8 pb-8">
        <p className={cn("text-3xl font-bold tracking-tight", priceClass)}>
          ₺{plan.priceAmountTry}
          {plan.priceSuffix && (
            <span className={cn("text-lg font-normal", helperTextClass)}>
              {plan.priceSuffix}
            </span>
          )}
          {plan.priceNote && (
            <span className={cn("ml-2 text-lg font-normal", helperTextClass)}>
              {plan.priceNote}
            </span>
          )}
        </p>
        <ul
          className={cn("my-6 space-y-3 text-sm leading-relaxed", perksClass)}
        >
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
