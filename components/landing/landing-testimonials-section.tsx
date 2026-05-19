import { LandingTestimonialsMarquee } from "@/components/landing/landing-testimonials-marquee";

const eyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-white/80 px-3.5 py-1 text-xs font-semibold tracking-[0.18em] text-emerald-700 shadow-sm ring-1 ring-emerald-500/20 backdrop-blur-sm dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";

export function LandingTestimonialsSection() {
  return (
    <section
      className="relative overflow-hidden border-t border-border/60 bg-muted/20 py-16 md:py-24"
      aria-labelledby="landing-testimonials-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/12" />
        <div className="absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/12" />
        <div className="absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/10" />
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[min(100%,720px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(16_185_129/0.08),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgb(52_211_153/0.12),transparent_68%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 xl:px-0">
        <div className="mx-auto max-w-3xl text-center">
          <p className={eyebrow}>Kullanıcı hikayeleri</p>
          <h2
            id="landing-testimonials-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            Kullanıcılarımız{" "}
            <span className="bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-200 dark:to-teal-300">
              IQfinansAI
            </span>
            &apos;ı anlatıyor.
          </h2>
        </div>

        <LandingTestimonialsMarquee />
      </div>
    </section>
  );
}
