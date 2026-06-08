import { landingEyebrow } from "@/components/landing/landing-eyebrow";
import { LandingModulesInteractive } from "@/components/landing/landing-modules-interactive";
import { LANDING_CONTAINER_CLASS } from "@/components/landing/landing-layout";

export function LandingModulesSection() {
  return (
    <section
      id="ana-moduller"
      className="relative border-t border-border/60 py-16 md:py-24"
      aria-labelledby="landing-modules-heading"
    >
      <div className={LANDING_CONTAINER_CLASS}>
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[min(100%,720px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(16_185_129/0.08),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgb(52_211_153/0.12),transparent_68%)]"
          aria-hidden
        />
        <div className="mx-auto max-w-3xl text-center">
          <p className={landingEyebrow}>Modüllerimiz</p>
          <h2
            id="landing-modules-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl md:leading-[1.15]"
          >
            <span className="bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-200 dark:to-teal-300">
              IQfinansAI
            </span>
            &apos;ın güçlü finans araçları
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Gelir-giderden AI analizine; bütçe, borç ve yatırım süreçlerini tek
            platformda keşfedin.
          </p>
        </div>

        <LandingModulesInteractive />
      </div>
    </section>
  );
}
