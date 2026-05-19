import { LandingFeaturesSection } from "@/components/landing/landing-features-section";
import { LandingModulesSection } from "@/components/landing/landing-modules-section";
import { LandingWhySection } from "@/components/landing/why/section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { LandingFaqSection } from "@/components/landing/landing-faq-section";
import { LandingTestimonialsSection } from "@/components/landing/landing-testimonials-section";
import { LandingJsonLd } from "@/components/seo/landing-json-ld";

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
