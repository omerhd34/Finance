import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { Button } from "@/components/ui/button";
import { SupportContactForm } from "@/components/landing/support-contact-form";
import { getSupportInboxEmail } from "@/lib/support-contact-email";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Destek",
  description:
    "IQfinansAI destek merkezi: hesap ve güvenlik ipuçları, iletişim formu. Sık sorular için SSS sayfasına bakın.",
  alternates: {
    canonical: "/destek",
    languages: { "tr-TR": "/destek" },
  },
  openGraph: {
    title: "Destek | IQfinansAI",
    description:
      "Destek iletişimi ve hesabınızla ilgili yardım. Ayrıntılı sorular için SSS.",
    url: `${siteUrl}/destek`,
    type: "website",
    locale: "tr_TR",
  },
};

const eyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 ring-1 ring-emerald-500/20 dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";

export default function DestekPage() {
  const inboxConfigured = Boolean(getSupportInboxEmail());

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Destek",
    description: "IQfinansAI destek merkezi; iletişim ve yardım kaynakları.",
    url: `${siteUrl}/destek`,
    inLanguage: "tr-TR",
    isPartOf: {
      "@type": "WebSite",
      name: "IQfinansAI",
      url: siteUrl,
    },
  };

  return (
    <LandingPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageJsonLd),
        }}
      />
      <LandingHeader />
      <main className="flex-1">
        <section
          className="border-b border-border/60 px-4 pb-14 pt-24 md:pb-20 md:pt-28"
          aria-labelledby="support-hero-heading"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className={eyebrow}>Yardım merkezi</p>
            <h1
              id="support-hero-heading"
              className="mt-5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-tight"
            >
              Sorularınıza{" "}
              <span className="bg-linear-to-r from-emerald-600 via-emerald-500 to-emerald-400 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-400 dark:to-emerald-500">
                hızlı yanıt
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Ürünle ilgili ayrıntılı soru ve yanıtlar için{" "}
              <Link
                href="/sss"
                className="font-medium text-emerald-600 underline underline-offset-4 hover:text-emerald-500 dark:text-emerald-400"
              >
                SSS
              </Link>{" "}
              sayfasına göz atın. Aradığınızı bulamazsanız aşağıdaki formdan
              bize yazın.
            </p>
          </div>
        </section>

        <section
          className="border-y border-border/50 bg-muted/30 px-4 py-12 md:py-16"
          aria-labelledby="support-contact-heading"
        >
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Mail className="h-6 w-6" aria-hidden />
            </div>
            <h2
              id="support-contact-heading"
              className="mt-4 text-xl font-bold tracking-tight text-foreground md:text-2xl"
            >
              Bize yazın
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Formu doldurun; mesajınız doğrudan destek gelen kutumuza iletilir.
            </p>
          </div>
          <SupportContactForm
            inboxConfigured={inboxConfigured}
            className="mx-auto mt-2"
          />
        </section>

        <section
          className="border-t border-border/60 bg-linear-to-b from-emerald-500/5 to-transparent px-4 py-14 md:py-20"
          aria-labelledby="support-cta-heading"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-2xl border border-emerald-500/20 bg-card/60 px-6 py-10 text-center shadow-lg backdrop-blur-sm md:px-10 md:py-11">
            <h2
              id="support-cta-heading"
              className="text-balance text-xl font-bold tracking-tight text-foreground md:text-2xl"
            >
              Henüz hesabınız yok mu?
            </h2>
            <p className="text-pretty text-muted-foreground md:text-lg">
              Dakikalar içinde kayıt olun; bütçe ve harcamalarınızı düzenlemeye
              başlayın.
            </p>
            <Button
              size="lg"
              asChild
              className="rounded-full bg-emerald-500 px-8 font-semibold text-white shadow-md shadow-emerald-900/30 transition hover:bg-emerald-400 hover:shadow-lg dark:shadow-emerald-900/50"
            >
              <Link href="/kayit">
                Kayıt ol
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <LandingFooter />
    </LandingPageShell>
  );
}
