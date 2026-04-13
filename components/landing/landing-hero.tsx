import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustItems = ["Güvenli kayıt", "Anında özet", "AI içgörüleri"];

export function LandingHero() {
  return (
    <section
      className="relative border-b border-white/6 px-4 pb-24 pt-16 md:pb-32 md:pt-20"
      aria-labelledby="landing-hero-heading"
    >
      <div className="pointer-events-none absolute left-1/2 top-24 h-px w-[min(90%,720px)] -translate-x-1/2 bg-linear-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="mx-auto max-w-3xl text-center">
        <p className="landing-eyebrow">Kişisel finans asistanınız</p>

        <h1
          id="landing-hero-heading"
          className="mt-6 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.1]"
        >
          Paranı{" "}
          <span className="bg-linear-to-r from-white via-emerald-100 to-emerald-400/90 bg-clip-text text-transparent">
            akıllıca
          </span>{" "}
          yönet
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-zinc-400 md:text-xl">
          Gelir ve giderlerinizi tek yerden izleyin, hedefler koyun ve yapay
          zekâ destekli önerilerle tasarruf fırsatlarını kaçırmayın.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            asChild
            className="landing-cta-primary group h-12 rounded-full px-8 text-base font-semibold"
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
            className="landing-cta-ghost h-12 rounded-full border px-8 text-base"
          >
            <Link href="/login">Hesabım var</Link>
          </Button>
        </div>

        <ul
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-zinc-500"
          aria-label="Öne çıkanlar"
        >
          {trustItems.map((label) => (
            <li key={label} className="flex items-center gap-2">
              <ShieldCheck
                className="h-4 w-4 shrink-0 text-emerald-500/80"
                aria-hidden
              />
              <span className="text-zinc-400">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
