import { LANDING_FEATURES } from "./landing-content";
import { LandingFeatureCard } from "./landing-feature-card";

const landingEyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-white/80 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 shadow-sm ring-1 ring-emerald-500/20 backdrop-blur-sm dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";

export function LandingFeaturesSection() {
  return (
    <section
      className="relative px-4 py-20 md:py-28"
      aria-labelledby="landing-features-heading"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className={landingEyebrow}>Özellikler</p>
          <h2
            id="landing-features-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            Finansını tek uygulamada topla
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Kişisel bütçenden AI önerilerine kadar ihtiyacın olan her şey.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {LANDING_FEATURES.map((f) => (
            <LandingFeatureCard
              key={f.title}
              title={f.title}
              description={f.description}
              icon={f.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
