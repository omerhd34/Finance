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

const landingEyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-white/80 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 shadow-sm ring-1 ring-emerald-500/20 backdrop-blur-sm dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";
const landingCtaPrimary =
  "bg-emerald-500 text-black shadow-md shadow-emerald-900/40 transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-900/50 dark:text-white";

export function LandingHero() {
  return (
    <section
      className="relative flex min-h-[calc(100dvh-4rem)] items-center border-b border-border/60 px-4 pb-24 pt-16 md:pb-32 md:pt-20"
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
          quality={100}
          className="object-cover object-center opacity-45 saturate-75 dark:opacity-100 dark:saturate-100"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/72 dark:bg-black/55" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className={landingEyebrow}>Kişisel finans asistanınız</p>

        <h1
          id="landing-hero-heading"
          className="mt-6 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.1]"
        >
          Paranı{" "}
          <span className="bg-linear-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
            akıllıca
          </span>{" "}
          yönet
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/85 md:text-xl">
          Gelir ve giderlerinizi tek yerden izleyin, hedefler koyun ve yapay
          zekâ destekli önerilerle tasarruf fırsatlarını kaçırmayın.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            asChild
            className={`${landingCtaPrimary} group h-12 rounded-full px-8 text-base font-semibold`}
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
            className="border-border bg-background text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground h-12 rounded-full border px-8 text-base cursor-pointer"
          >
            <Link href="/login">Hesabım var</Link>
          </Button>
        </div>

        <ul
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/80"
          aria-label="Öne çıkanlar"
        >
          {trustItems.map((label) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-full bg-black/25 px-2.5 py-1 backdrop-blur-[1px]"
            >
              <ShieldCheck
                className="h-4 w-4 shrink-0 text-emerald-400"
                aria-hidden
              />
              <span className="text-white/80">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
