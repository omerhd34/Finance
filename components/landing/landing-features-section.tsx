import { LandingFeatureComparisonTable } from "./landing-feature-comparison-table";

const landingEyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-white/80 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 shadow-sm ring-1 ring-emerald-500/20 backdrop-blur-sm dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";

export function LandingFeaturesSection() {
  return (
    <section
      className="relative py-20 md:py-28"
      aria-labelledby="landing-features-heading"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
        <div className="mx-auto max-w-2xl text-center">
          <p className={landingEyebrow}>Plan karşılaştırması</p>
          <h2
            id="landing-features-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            Ücretsiz ve{" "}
            <span className="bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-200 dark:to-teal-300">
              Premium
            </span>
            &apos;da neler var?
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Ücretsiz ve Premium planını yan yana karşılaştırın. Aylık ücret ve
            kapsam tabloda yer alır.
          </p>
        </div>

        <div className="mt-14">
          <LandingFeatureComparisonTable />
        </div>
      </div>
    </section>
  );
}
