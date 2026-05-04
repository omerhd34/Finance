import Link from "next/link";
import { Quote } from "lucide-react";
import { LANDING_TESTIMONIALS } from "@/components/landing/landing-content";

const eyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-white/80 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 shadow-sm ring-1 ring-emerald-500/20 backdrop-blur-sm dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";

export function LandingTestimonialsSection() {
  return (
    <section
      className="relative border-t border-border/60 bg-muted/25 py-16 md:py-20"
      aria-labelledby="landing-testimonials-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
        <div className="mx-auto max-w-2xl text-center">
          <p className={eyebrow}>Topluluktan</p>
          <h2
            id="landing-testimonials-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            Gerçek kullanıcı sesleri
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Kullanıcılarımızdan gelen geri bildirimlerden örnekler. İsterseniz
            kendi yorumunuzu da bu alana ekleyebiliriz.{" "}
            <Link
              href="/destek"
              className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
            >
              Destek
            </Link>{" "}
            üzerinden bize yazmanız yeterli.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {LANDING_TESTIMONIALS.map((t) => (
            <li key={t.id}>
              <figure className="flex h-full flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <Quote
                  className="h-8 w-8 shrink-0 text-emerald-500/80"
                  aria-hidden
                />
                <blockquote className="mt-4 flex-1 text-pretty text-base leading-relaxed text-foreground">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-border/60 pt-4 text-sm">
                  <span className="font-semibold text-foreground">
                    {t.attribution}
                  </span>
                  <span className="block text-muted-foreground">
                    {t.context}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
          Veri güvenliği ve gizlilik için{" "}
          <Link
            href="/yasal-bilgiler"
            className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
          >
            yasal bilgiler
          </Link>{" "}
          sayfamıza göz atın.
        </p>
      </div>
    </section>
  );
}
