import { LandingProductShowcaseMarquee } from "@/components/landing/landing-product-showcase-marquee";

const landingEyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-white/80 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 shadow-sm ring-1 ring-emerald-500/20 backdrop-blur-sm dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";

export function LandingProductShowcaseSection() {
  return (
    <section
      className="relative border-t border-border/60 py-16 md:py-24"
      aria-labelledby="landing-product-showcase-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
        <div className="mx-auto max-w-3xl text-center">
          <p className={landingEyebrow}>Ürün tanıtımı</p>
          <h2
            id="landing-product-showcase-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            IQfinansAI&apos;ın{" "}
            <span className="bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-200 dark:to-teal-300">
              güçlü finans araçları
            </span>
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
