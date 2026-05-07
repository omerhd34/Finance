import { LANDING_FEATURES } from "./landing-content";
import { LandingFeatureCard } from "./landing-feature-card";
import { cn } from "@/lib/common/utils";
const landingEyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-white/80 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 shadow-sm ring-1 ring-emerald-500/20 backdrop-blur-sm dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";

const freeFeatures = LANDING_FEATURES.filter((f) => !f.premium);
const premiumFeatures = LANDING_FEATURES.filter((f) => f.premium);

export function LandingFeaturesSection() {
  return (
    <section
      className="relative py-20 md:py-28"
      aria-labelledby="landing-features-heading"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
        <div className="mx-auto max-w-2xl text-center">
          <p className={landingEyebrow}>Özellikler</p>
          <h2
            id="landing-features-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            Finansını tek uygulamada topla
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Günlük finans işlerinizin çoğu ücretsiz planda;{" "}
            <span className="font-medium text-foreground">
              AI analiz ve AI asistanı ile mesajlaşma, fiş tarama
            </span>{" "}
            ve{" "}
            <span className="font-medium text-foreground">yatırım takibi</span>{" "}
            ise Premium ile açılır — fark burada.
          </p>
        </div>

        <div className="mt-14 space-y-12">
          <div>
            <h3 className="mb-5 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Ücretsiz planda
            </h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
              {freeFeatures.map((f) => (
                <LandingFeatureCard
                  key={f.title}
                  title={f.title}
                  description={f.description}
                  icon={f.icon}
                  premium={false}
                />
              ))}
            </div>
          </div>

          <div
            className={cn(
              "rounded-2xl border border-emerald-500/30 bg-linear-to-b from-emerald-500/10 via-card to-card p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-500/20 sm:p-8",
              "dark:from-emerald-500/15 dark:shadow-emerald-950/25",
            )}
            aria-labelledby="landing-features-premium-heading"
          >
            <div className="mx-auto mb-6 max-w-2xl text-center">
              <h3
                id="landing-features-premium-heading"
                className="text-base font-semibold text-foreground sm:text-lg"
              >
                Premium ile AI analiz ve asistan
              </h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                Premium ile AI analiz raporu ve AI asistanı ile mesajlaşma (tam
                metin, PDF indirme), fiş-fatura OCR ve canlı kotasyonlu yatırım
                portföyü tam kapsamda açılır; ücretsiz plandaki özellikleriniz
                aynen devam eder.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 lg:gap-6">
              {premiumFeatures.map((f) => (
                <LandingFeatureCard
                  key={f.title}
                  title={f.title}
                  description={f.description}
                  icon={f.icon}
                  premium
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
