import { LANDING_PLANS } from "./landing-content";
import { LandingPricingCard } from "./landing-pricing-card";

const landingEyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-white/80 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 shadow-sm ring-1 ring-emerald-500/20 backdrop-blur-sm dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";

export function LandingPricingSection() {
  return (
    <section
      className="relative border-t border-border/60 px-4 py-20 md:py-28"
      aria-labelledby="landing-pricing-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className={landingEyebrow}>Fiyatlandırma</p>
          <h2
            id="landing-pricing-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            Sana uygun plan
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Temel özellikler ücretsiz; gelişmiş AI ile Pro yakında.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 md:gap-8 lg:max-w-none">
          {LANDING_PLANS.map((plan) => (
            <LandingPricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
