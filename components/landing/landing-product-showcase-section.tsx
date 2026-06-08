import { landingEyebrow } from "@/components/landing/landing-eyebrow";
import { LandingProductShowcaseMarquee } from "@/components/landing/landing-product-showcase-marquee";
import { LANDING_CONTAINER_CLASS } from "@/components/landing/landing-layout";

export function LandingProductShowcaseSection() {
  return (
    <section
      className="relative border-t border-border/60 py-16 md:py-24"
      aria-labelledby="landing-product-showcase-heading"
    >
      <div className={LANDING_CONTAINER_CLASS}>
        <div className="mx-auto max-w-3xl text-center">
          <p className={landingEyebrow}>Ürün tanıtımı</p>
          <h2
            id="landing-product-showcase-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            <span className="bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-200 dark:to-teal-300">
              IQfinansAI
            </span>
            &apos;ın güçlü finans araçları
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Gelir-giderden AI analizine; bütçe, borç ve yatırım süreçlerini tek
            platformda yönetin.
          </p>
        </div>

        <LandingProductShowcaseMarquee />
      </div>
    </section>
  );
}
