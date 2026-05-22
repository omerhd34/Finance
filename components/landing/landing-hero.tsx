import Link from "next/link";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { LandingHeroTrust } from "@/components/landing/landing-hero-trust";

const LandingHeroIsometricIllustration = dynamic(
  () =>
    import("@/components/landing/landing-hero-isometric").then(
      (m) => m.LandingHeroIsometricIllustration,
    ),
  { loading: () => null },
);

const primaryCtaClass =
  "inline-flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-950/45 transition hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-950/50 sm:w-auto";

const secondaryCtaClass =
  "inline-flex h-10 flex-1 items-center justify-center rounded-full border border-white/25 bg-white/12 px-5 text-sm text-white backdrop-blur-md transition hover:bg-white/22 sm:h-12 sm:flex-initial sm:px-8 sm:text-base";

export function LandingHero() {
  return (
    <section
      className="relative flex flex-col justify-center overflow-hidden border-b border-border/60 pb-10 pt-22 sm:min-h-[calc(100dvh)] sm:pb-14 sm:pt-24 md:pb-16 md:pt-28"
      aria-labelledby="landing-hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-cover bg-center animate-hero-bg-pan opacity-[0.52] saturate-[0.88] contrast-[0.94] dark:opacity-[0.68] dark:saturate-[0.8] dark:contrast-[0.92]"
          style={{ backgroundImage: "url(/finance.webp)" }}
          role="img"
          aria-label="Kişisel finans, bütçe ve harcama yönetimi — IQfinansAI arka plan görseli"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/42 to-black/62 dark:from-black/72 dark:via-black/60 dark:to-black/80" />
        <div className="absolute inset-0 bg-linear-to-tr from-emerald-950/28 via-transparent to-teal-950/18 dark:from-emerald-950/42 dark:to-teal-950/28" />
        <div className="absolute inset-y-0 left-0 w-[58%] max-w-3xl bg-linear-to-r from-black/42 to-transparent dark:from-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_88%_70%_at_50%_38%,transparent_0%,rgba(0,0,0,0.62)_100%)] dark:bg-[radial-gradient(ellipse_88%_70%_at_50%_38%,transparent_0%,rgba(0,0,0,0.72)_100%)]" />
        <div className="absolute -left-[20%] top-1/4 hidden h-[min(55vw,420px)] w-[min(55vw,420px)] rounded-full bg-emerald-500/15 blur-[100px] sm:block" />
        <div className="absolute -right-[15%] bottom-0 hidden h-[min(45vw,360px)] w-[min(45vw,360px)] rounded-full bg-teal-400/10 blur-[90px] sm:block" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 xl:px-0">
        <div className="flex flex-col gap-10 xl:flex-row xl:items-center xl:gap-12 2xl:gap-20">
          <div className="flex-1 text-center xl:text-left">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-white/90 px-3 py-1 text-[10px] font-semibold tracking-wide text-emerald-800 shadow-md shadow-black/10 ring-1 ring-emerald-500/25 backdrop-blur-md dark:border-emerald-400/35 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-400/20 sm:px-3.5 md:text-xs">
              <Sparkles
                className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-300"
                aria-hidden
              />
              <span className="font-extrabold tracking-tight">IQfinansAI</span>
              <span className="mx-0.5 text-emerald-600/70 dark:text-emerald-300/70">
                ·
              </span>
              Kişişel finans asistanı
            </p>

            <h1
              id="landing-hero-heading"
              className="isolate mt-4 text-balance text-[28px] font-bold leading-[1.15] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] sm:mt-6 sm:text-5xl sm:leading-[1.1] md:text-6xl md:leading-[1.08]"
            >
              Finansını{" "}
              <span className="inline-block transform-gpu bg-linear-to-r from-emerald-200 via-emerald-300 to-emerald-400 bg-clip-text text-transparent [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                akıllıca
              </span>{" "}
              yönet
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-white/85 sm:mt-8 sm:text-lg md:text-xl xl:mx-0">
              Yapay zekâ destekli{" "}
              <strong className="font-semibold text-white">IQfinansAI</strong>{" "}
              ile harcamalarını tek ekrandan gör, hedeflerine bilinçli ilerle.
            </p>

            <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-3 xl:justify-start">
              <Link href="/kayit" className={primaryCtaClass}>
                Ücretsiz Kayıt Ol
              </Link>
              <div className="flex w-full items-center justify-center gap-2 sm:w-auto">
                <Link href="/giris" className={secondaryCtaClass}>
                  Hesabım var
                </Link>
              </div>
            </div>

            <LandingHeroTrust />
          </div>

          <div className="hidden w-full min-w-0 xl:block xl:w-[480px] 2xl:w-[540px] xl:shrink-0">
            <LandingHeroIsometricIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
