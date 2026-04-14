import { LANDING_PLANS } from "./landing-content";
import { LandingPricingCard } from "./landing-pricing-card";

export function LandingPricingSection() {
  return (
    <section
      className="relative border-t border-white/6 px-4 py-20 md:py-28"
      aria-labelledby="landing-pricing-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="landing-eyebrow">Fiyatlandırma</p>
          <h2
            id="landing-pricing-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-white md:text-4xl"
          >
            Sana uygun plan
          </h2>
          <p className="mt-4 text-pretty text-lg text-zinc-400">
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
