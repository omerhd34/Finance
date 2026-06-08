import { landingEyebrow } from "@/components/landing/landing-eyebrow";
import { LandingFeatureComparisonTable } from "./landing-feature-comparison-table";
import { LANDING_CONTAINER_CLASS } from "@/components/landing/landing-layout";

export function LandingFeaturesSection() {
  return (
    <section
      id="plan-karsilastirmasi"
      className="relative py-20 md:py-28"
      aria-labelledby="landing-features-heading"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <div className={LANDING_CONTAINER_CLASS}>
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[min(100%,720px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(16_185_129/0.08),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgb(52_211_153/0.12),transparent_68%)]"
          aria-hidden
        />
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
