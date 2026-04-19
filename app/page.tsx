import { LandingFeaturesSection } from "@/components/landing/landing-features-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { LandingPricingSection } from "@/components/landing/landing-pricing-section";
import { LandingJsonLd } from "@/components/seo/landing-json-ld";

export default function LandingPage() {
  return (
    <LandingPageShell>
      <LandingJsonLd />
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeaturesSection />
        <LandingPricingSection />
      </main>
      <LandingFooter />
    </LandingPageShell>
  );
}
