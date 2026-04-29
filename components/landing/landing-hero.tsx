import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { LandingHeroIsometricIllustration } from "@/components/landing/landing-hero-isometric";
import { Button } from "@/components/ui/button";

const trustItems = [
  "Güvenli kayıt",
  "Gerçek zamanlı takip",
  "AI içgörüleri",
  "Borç/alacak yönetimi",
];

export function LandingHero() {
  return (
    <section
      className="relative flex min-h-[calc(100dvh)] items-center overflow-hidden border-b border-border/60 px-4 pb-14 pt-20 md:pb-28 md:pt-24"
      aria-labelledby="landing-hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <Image
          src="/finance.jpg"
          alt="Kişisel finans, bütçe ve harcama yönetimi — IQfinansAI arka plan görseli"
          fill
          priority
          quality={88}
          className="object-cover object-center animate-hero-bg-pan opacity-70 dark:opacity-95"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/45 via-black/38 to-black/58 dark:from-black/68 dark:via-black/56 dark:to-black/78" />
        <div className="absolute inset-0 bg-linear-to-tr from-emerald-950/35 via-transparent to-teal-950/22 dark:from-emerald-950/55 dark:to-teal-950/35" />
        <div className="absolute inset-y-0 left-0 w-[56%] bg-linear-to-r from-black/35 to-transparent dark:from-black/45" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_40%,transparent_0%,rgba(0,0,0,0.55)_100%)]" />
        <div className="absolute -left-[20%] top-1/4 h-[min(55vw,420px)] w-[min(55vw,420px)] rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="absolute -right-[15%] bottom-0 h-[min(45vw,360px)] w-[min(45vw,360px)] rounded-full bg-teal-400/10 blur-[90px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_min(46%,min(100%,520px))] lg:gap-14 xl:gap-20">
          <div className="text-center lg:text-left">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-white/90 px-3.5 py-1 text-[10px] font-semibold tracking-wide text-emerald-800 shadow-md shadow-black/10 ring-1 ring-emerald-500/25 backdrop-blur-md dark:border-emerald-400/35 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-400/20 md:text-xs">
              <Sparkles
                className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-300"
                aria-hidden
              />
              <span className="font-extrabold tracking-tight">IQfinansAI</span>
              <span className="mx-0.5 text-emerald-600/70 dark:text-emerald-300/70">
                ·
              </span>
              Kişisel finans asistanınız
            </p>

            <h1
              id="landing-hero-heading"
              className="mt-6 text-balance text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] sm:text-5xl md:text-6xl md:leading-[1.08]"
            >
              Finansını{" "}
              <span className="bg-linear-to-r from-emerald-200 via-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                akıllıca
              </span>{" "}
              yönet
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/92 sm:mt-8 sm:text-lg md:text-xl lg:mx-0">
              <strong className="font-semibold text-white">IQfinansAI</strong>{" "}
              ile finansını tek ekrandan netleştir; harcamalarını anlık gör,
              hedeflerine bilinçli ilerle ve akıllı önerilerle birikimini büyüt.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap lg:justify-start">
              <Button
                size="lg"
                asChild
                className="group h-12 w-full rounded-full bg-emerald-500 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-950/45 transition hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-950/50 sm:w-auto"
              >
                <Link href="/kayit">Kayıt ol</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 w-full cursor-pointer rounded-full border border-white/25 bg-white/12 px-8 text-base text-white backdrop-blur-md transition hover:bg-white/22 sm:w-auto"
              >
                <Link href="/giris">Hesabım var</Link>
              </Button>
              <Link
                href="/sss"
                className="group inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-5 text-sm font-semibold text-emerald-100 backdrop-blur-sm transition hover:border-emerald-300/60 hover:bg-emerald-400/18 hover:text-emerald-50 sm:w-auto"
              >
                SSS
                <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
            </div>

            <ul
              className="mt-10 grid grid-cols-2 justify-items-center gap-2 text-xs sm:mt-14 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-3 sm:text-sm lg:justify-start"
              aria-label="Öne çıkanlar"
            >
              {trustItems.map((label) => (
                <li
                  key={label}
                  className="flex w-full max-w-44 items-center justify-center gap-1 rounded-full border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md sm:w-auto sm:max-w-none sm:gap-2 sm:bg-black/28 sm:py-1.5"
                >
                  <ShieldCheck
                    className="hidden h-3.5 w-3.5 shrink-0 text-emerald-400 sm:block"
                    aria-hidden
                  />
                  <span className="whitespace-nowrap text-white/92">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden lg:block">
            <LandingHeroIsometricIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
