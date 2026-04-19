import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  LineChart,
  Lock,
  Sparkles,
  Target,
} from "lucide-react";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "IQfinansAI’nin misyonu, değerleri ve kişisel finansınızı netleştirmek için benimsediğimiz yaklaşım.",
  alternates: {
    canonical: "/hakkimizda",
    languages: { "tr-TR": "/hakkimizda" },
  },
  openGraph: {
    title: "Hakkımızda | IQfinansAI",
    description:
      "Finansal netliği herkes için erişilebilir kılmak: ürün felsefemiz, değerlerimiz ve güven yaklaşımımız.",
    url: `${siteUrl}/hakkimizda`,
    type: "website",
    locale: "tr_TR",
  },
};

const eyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 ring-1 ring-emerald-500/20 dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";

const values = [
  {
    icon: Target,
    title: "Netlik önce",
    description:
      "Karmaşık tablolar değil; günlük kararlarınızı kolaylaştıran sade akışlar ve anlaşılır özetler.",
  },
  {
    icon: HeartHandshake,
    title: "Kullanıcı odaklılık",
    description:
      "Ürünü gerçek hayat senaryolarına göre şekillendiriyor; geri bildirimleri yol haritamızın merkezine koyuyoruz.",
  },
  {
    icon: Lock,
    title: "Veri güvenliği",
    description:
      "Finansal veriniz hassastır. Güvenli oturum, dikkatli erişim modelleri ve şeffaf gizlilik ilkeleriyle ilerliyoruz.",
  },
  {
    icon: Sparkles,
    title: "Yapay zekâ, yardımcı",
    description:
      "Otomasyon ve içgörüler; kontrol sizde kalsın diye öneri düzeyinde tasarlanır — yerine geçmez, yön gösterir.",
  },
  {
    icon: LineChart,
    title: "Sürekli gelişim",
    description:
      "Bütçe, borç, yatırım ve hedef modüllerini birlikte güçlendiriyor; finansal resminizi zamanla daha da netleştiriyoruz.",
  },
] as const;

export default function HakkimizdaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Hakkımızda",
    description:
      "IQfinansAI hakkında misyon, değerler ve ürün yaklaşımı bilgileri.",
    url: `${siteUrl}/hakkimizda`,
    inLanguage: "tr-TR",
    isPartOf: {
      "@type": "WebSite",
      name: "IQfinansAI",
      url: siteUrl,
    },
    about: {
      "@type": "Organization",
      name: "IQfinansAI",
      url: siteUrl,
    },
  };

  return (
    <LandingPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingHeader />
      <main className="flex-1">
        <section
          className="border-b border-border/60 px-4 pb-16 pt-24 md:pb-20 md:pt-28"
          aria-labelledby="about-hero-heading"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className={eyebrow}>IQfinansAI</p>
            <h1
              id="about-hero-heading"
              className="mt-5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-tight"
            >
              Finansal netliği{" "}
              <span className="bg-linear-to-r from-emerald-600 via-emerald-500 to-emerald-400 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-400 dark:to-emerald-500">
                herkes için
              </span>{" "}
              erişilebilir kılmak
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Gelir–gider takibinden borç ve yatırım planına, hedeflerden yapay
              zekâ destekli özetlere kadar; paranızı tek panelde toparlayıp
              kararlarınızı güçlendirmenize odaklanıyoruz.
            </p>
          </div>
        </section>

        <section
          className="px-4 py-16 md:py-24"
          aria-labelledby="about-mission-heading"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
            <div>
              <h2
                id="about-mission-heading"
                className="text-2xl font-bold tracking-tight text-foreground md:text-3xl"
              >
                Neden varız?
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground leading-relaxed md:text-lg">
                Çoğu insan parayı “yönetmiyor”; parçalı uygulamalar, dağınık
                ekranlar ve net olmayan özetler arasında kayboluyor. IQfinansAI,
                bu dağınıklığı azaltmak ve finansal durumunuzu günü gününe
                görünür kılmak için tasarlandı.
              </p>
              <p className="mt-4 text-pretty text-muted-foreground leading-relaxed md:text-lg">
                Amacımız panik satışı veya agresif tavsiye değil;{" "}
                <strong className="font-semibold text-foreground">
                  farkındalık ve disiplin
                </strong>{" "}
                kazandıran, sade ve güven veren bir deneyim sunmak.
              </p>
            </div>
            <Card className="border-border/80 bg-card/80 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Ürün yaklaşımımız</CardTitle>
                <CardDescription>
                  Tasarım ve mühendislikte öncelik sıramız
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <span className="font-medium text-foreground">
                    Tek merkez:
                  </span>{" "}
                  Harcamalar, tekrarlayan ödemeler, borçlar, bütçeler ve
                  hedefler aynı bağlamda; kopuk tablolar yerine bütünsel bir
                  resim.
                </p>
                <p>
                  <span className="font-medium text-foreground">
                    Anlaşılır metrikler:
                  </span>{" "}
                  “Ne oldu?” sorusuna hızlı cevap; gerektiğinde detaya inme
                  özgürlüğü.
                </p>
                <p>
                  <span className="font-medium text-foreground">
                    Yapay zekâ ile ölçülü destek:
                  </span>{" "}
                  Harcama özetleri ve içgörüler; kararın sizde kaldığı, kontrol
                  edilebilir öneriler.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section
          className="border-y border-border/50 bg-muted/30 px-4 py-16 md:py-24"
          aria-labelledby="about-values-heading"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className={eyebrow}>Değerlerimiz</p>
              <h2
                id="about-values-heading"
                className="mt-4 text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl"
              >
                Söz verdiğimiz şey, deneyimin kendisi
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground md:text-lg">
                Büyük vaatler yerine, her sürümde hissedilen kalite ve güven
                inşa etmeyi tercih ediyoruz.
              </p>
            </div>

            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {values.map(({ icon: Icon, title, description }) => (
                <li key={title}>
                  <Card className="h-full border-border/70 bg-background/80 transition hover:border-emerald-500/30 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <CardTitle className="pt-2 text-base">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                      {description}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="px-4 py-16 md:py-24"
          aria-labelledby="about-team-heading"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="about-team-heading"
              className="text-2xl font-bold tracking-tight text-foreground md:text-3xl"
            >
              Arkasında kim var?
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground leading-relaxed md:text-lg">
              IQfinansAI,{" "}
              <a
                href="http://omerhalisdemir.com.tr/"
                className="font-semibold text-emerald-600 underline-offset-4 transition hover:underline dark:text-emerald-400"
                rel="noopener noreferrer"
                target="_blank"
              >
                Ömer Halis Demir
              </a>{" "}
              tarafından geliştirilmektedir. Ürün kararlarında şeffaflık,
              erişilebilirlik ve uzun vadeli sürdürülebilirlik önceliklidir.
            </p>
          </div>
        </section>

        <section
          className="border-t border-border/60 bg-linear-to-b from-emerald-500/5 to-transparent px-4 py-16 md:py-20"
          aria-labelledby="about-cta-heading"
        >
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-2xl border border-emerald-500/20 bg-card/60 px-6 py-10 text-center shadow-lg backdrop-blur-sm md:px-12 md:py-12">
            <h2
              id="about-cta-heading"
              className="text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl"
            >
              Finansal resminizi birlikte netleştirelim
            </h2>
            <p className="max-w-xl text-pretty text-muted-foreground md:text-lg">
              Dakikalar içinde hesap oluşturun; gelir ve giderlerinizi
              düzenlemeye, hedef koymaya ve içgörülere hemen başlayın.
            </p>
            <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Button
                size="lg"
                asChild
                className="rounded-full bg-emerald-500 px-8 font-semibold text-white shadow-md shadow-emerald-900/30 transition hover:bg-emerald-400 hover:shadow-lg dark:shadow-emerald-900/50"
              >
                <Link href="/register">
                  Ücretsiz başla
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="rounded-full px-8"
              >
                <Link href="/">Ana sayfaya dön</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </LandingPageShell>
  );
}
