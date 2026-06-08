import { WhyGrid } from "@/components/landing/why/why-grid";
import { landingEyebrow } from "../landing-eyebrow";
import { LANDING_CONTAINER_CLASS } from "@/components/landing/landing-layout";

export function LandingWhySection() {
  return (
    <section
      id="neden-iqfinansai"
      className="relative overflow-hidden border-t border-border/60 py-16 md:py-28"
      aria-labelledby="landing-why-heading"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[min(100%,720px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(16_185_129/0.08),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgb(52_211_153/0.12),transparent_68%)]"
        aria-hidden
      />
      <div className={`relative ${LANDING_CONTAINER_CLASS}`}>
        <div className="mx-auto max-w-3xl text-center">
          <p className={landingEyebrow}>Neden IQfinansAI</p>
          <h2
            id="landing-why-heading"
            className="mt-5 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl md:leading-[1.15]"
          >
            Neden{" "}
            <span className="bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-200 dark:to-teal-300">
              IQfinansAI
            </span>{" "}
            kullanmalısınız?
          </h2>
        </div>

        <WhyGrid />
      </div>
    </section>
  );
}
