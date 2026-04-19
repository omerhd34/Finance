import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";
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
      className="relative flex min-h-[calc(100dvh)] items-center border-b border-border/60 px-4 pb-12 pt-20 md:pb-32 md:pt-20"
      aria-labelledby="landing-hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <Image
          src="/finance.jpg"
          alt="Finance"
          fill
          priority
          quality={75}
          className="object-cover object-center opacity-100 saturate-100"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60 md:bg-black/55" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center rounded-full border border-emerald-500/35 bg-white/80 px-3.5 py-1 text-[10px] md:text-xs font-semibold tracking-wide text-emerald-700 shadow-sm ring-1 ring-emerald-500/20 backdrop-blur-sm dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30">
          <span className="font-extrabold tracking-tight">IQfinansAI</span>
          <span className="mx-1.5 text-emerald-600/70 dark:text-emerald-300/60">
            ·
          </span>
          Kişisel finans asistanınız
        </p>

        <h1
          id="landing-hero-heading"
          className="mt-6 text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.1]"
        >
          Paranızı{" "}
          <span className="bg-linear-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
            akıllıca
          </span>{" "}
          yönetin
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/90 sm:mt-6 sm:text-lg md:text-xl">
          <strong className="font-semibold text-white">IQfinansAI</strong> ile
          gelir ve giderlerinizi tek yerden izleyin, hedefler koyun ve yapay
          zekâ destekli önerilerle tasarruf fırsatlarını kaçırmayın.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            asChild
            className="bg-emerald-500 text-white shadow-md shadow-emerald-900/40 transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-900/50 group h-12 w-full rounded-full px-8 text-base font-semibold sm:w-auto"
          >
            <Link href="/register">
              Ücretsiz başla
              <ArrowRight
                className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 h-12 w-full rounded-full border px-8 text-base cursor-pointer sm:w-auto"
          >
            <Link href="/login">Hesabım var</Link>
          </Button>
        </div>
        <ul
          className="mt-10 grid grid-cols-2 justify-center gap-2 text-xs sm:mt-14 sm:flex sm:flex-wrap sm:gap-x-8 sm:gap-y-3 sm:text-sm"
          aria-label="Öne çıkanlar"
        >
          {trustItems.map((label) => (
            <li
              key={label}
              className="flex items-center justify-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm sm:bg-black/25 sm:px-2.5 sm:py-1"
            >
              <ShieldCheck
                className="h-3.5 w-3.5 shrink-0 text-emerald-400"
                aria-hidden
              />
              <span className="text-white/90 whitespace-nowrap">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
