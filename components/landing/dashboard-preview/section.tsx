import { landingEyebrow } from "@/components/landing/landing-eyebrow";
import { DashboardPreviewShell } from "@/components/landing/dashboard-preview/dashboard-preview-shell";

export function LandingDashboardSection() {
  return (
    <section
      className="relative border-t border-border/60 py-16 md:py-24"
      aria-labelledby="landing-dashboard-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[min(100%,720px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(16_185_129/0.08),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgb(52_211_153/0.12),transparent_68%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className={landingEyebrow}>Canlı dashboard</p>
          <h2
            id="landing-dashboard-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl md:leading-[1.15]"
          >
            Tek ekranda{" "}
            <span className="bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-200 dark:to-teal-300">
              finansal panoraman
            </span>
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Gelir, gider, tasarruf ve kategori dağılımı; tüm verilerin tek bir
            dashboard üzerinde anlamlı grafiklerle.
          </p>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-2xl bg-linear-to-br from-violet-100/90 via-sky-50/80 to-emerald-50/70 p-3 shadow-inner ring-1 ring-border/40 sm:p-6 md:p-8 lg:mt-14 dark:from-violet-950/40 dark:via-sky-950/30 dark:to-emerald-950/25">
          <DashboardPreviewShell />
        </div>
      </div>
    </section>
  );
}
