import { landingWhyEyebrow } from "@/components/landing/why/constants";
import { WhyGrid } from "@/components/landing/why/why-grid";

export function LandingWhySection() {
  return (
    <section
      className="relative border-t border-border/60 py-16 md:py-24"
      aria-labelledby="landing-why-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
        <div className="mx-auto max-w-3xl text-center">
          <p className={landingWhyEyebrow}>Neden IQfinansAI</p>
          <h2
            id="landing-why-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            Neden IQfinansAI{" "}
            <span className="bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-200 dark:to-teal-300">
              kullanmalısınız?
            </span>
          </h2>
        </div>

        <WhyGrid />
      </div>
    </section>
  );
}
