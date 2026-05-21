import dynamic from "next/dynamic";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { LandingJsonLd } from "@/components/seo/landing-json-ld";

function LandingSectionFallback({
  minHeight = "24rem",
}: {
  minHeight?: string;
}) {
  return (
    <div
      className="border-t border-border/60"
      style={{ minHeight }}
      aria-hidden
    />
  );
}

const LandingModulesSection = dynamic(
  () =>
    import("@/components/landing/landing-modules-section").then(
      (m) => m.LandingModulesSection,
    ),
  { loading: () => <LandingSectionFallback minHeight="32rem" /> },
);

const LandingWhySection = dynamic(
  () =>
    import("@/components/landing/why/section").then((m) => m.LandingWhySection),
  { loading: () => <LandingSectionFallback minHeight="28rem" /> },
);

const LandingFeaturesSection = dynamic(
  () =>
    import("@/components/landing/landing-features-section").then(
      (m) => m.LandingFeaturesSection,
    ),
  { loading: () => <LandingSectionFallback minHeight="28rem" /> },
);

const LandingTestimonialsSection = dynamic(
  () =>
    import("@/components/landing/landing-testimonials-section").then(
      (m) => m.LandingTestimonialsSection,
    ),
  { loading: () => <LandingSectionFallback minHeight="24rem" /> },
);

const LandingFaqSection = dynamic(
  () =>
    import("@/components/landing/landing-faq-section").then(
      (m) => m.LandingFaqSection,
    ),
  { loading: () => <LandingSectionFallback minHeight="20rem" /> },
);

const LandingFooter = dynamic(
  () =>
    import("@/components/landing/landing-footer").then((m) => m.LandingFooter),
  { loading: () => <LandingSectionFallback minHeight="12rem" /> },
);

export default function LandingPage() {
  return (
    <LandingPageShell>
      <LandingJsonLd />
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingModulesSection />
        <LandingWhySection />
        <LandingFeaturesSection />
        <LandingTestimonialsSection />
        <LandingFaqSection />
      </main>
      <LandingFooter />
    </LandingPageShell>
  );
}
