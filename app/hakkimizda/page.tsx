import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  LineChart,
  Lock,
  Sparkles,
  Target,
  Zap, // Yeni icon
  Shapes, // Yeni icon
  ShieldCheck, // Yeni icon
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
    "IQfinansAI’nin misyonu, değerleri ve kişisel finansınızı netleştirmek için benimsediğimiz modern yaklaşım.",
  alternates: {
    canonical: "/hakkimizda",
    languages: { "tr-TR": "/hakkimizda" },
  },
  openGraph: {
    title: "Hakkımızda | IQfinansAI",
    description:
      "Finansal özgürlüğe giden yolu teknolojiyle sadeleştiriyoruz. Değerlerimiz ve vizyonumuz hakkında bilgi edinin.",
    url: `${siteUrl}/hakkimizda`,
    type: "website",
    locale: "tr_TR",
  },
};

const eyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 ring-1 ring-emerald-500/20 dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";

const aboutSectionBase =
  "border-b border-slate-200/45 bg-slate-50 dark:border-zinc-800/45 dark:bg-zinc-950";

const values = [
  {
    icon: Target,
    title: "Finansal Berraklık",
    description:
      "Karmaşık tabloların gürültüsünü siliyor; sadece ihtiyaç duyduğunuz veriyi, en sade ve anlaşılır haliyle sunuyoruz.",
  },
  {
    icon: Lock,
    title: "Sarsılmaz Güvenlik",
    description:
      "Verileriniz en değerli varlığınızdır. Banka düzeyinde koruma standartları ve şeffaf gizlilik politikalarıyla hareket ediyoruz.",
  },
  {
    icon: Sparkles,
    title: "Zekice İçgörüler",
    description:
      "Yapay zekayı sadece bir araç olarak değil; kararlarınızı güçlendiren, gizli kalmış detayları fark eden bir asistan olarak konumluyoruz.",
  },
  {
    icon: Shapes, // Yeni
    title: "Bütünsel Bakış",
    description:
      "Bütçe, borç ve yatırımı birbirinden ayırmıyoruz. Paranızın tüm parçalarını tek bir büyük resimde birleştiriyoruz.",
  },
  {
    icon: Zap, // Yeni
    title: "Zaman Verimliliği",
    description:
      "Finans yönetimi bir iş yükü olmamalı. Otomasyon yeteneklerimizle manuel veri girişini azaltıp size zaman kazandırıyoruz.",
  },
  {
    icon: HeartHandshake,
    title: "Topluluk Odaklılık",
    description:
      "Gelişimimizi doğrudan kullanıcı geri bildirimleriyle şekillendiriyor, gerçek ihtiyaçlara çözüm üreten bir yapı kuruyoruz.",
  },
  {
    icon: LineChart,
    title: "Sürekli İnovasyon",
    description:
      "Finansal teknolojiler hızla değişiyor. Biz de her gün yeni algoritmalar ve özelliklerle bu değişimin öncüsü kalıyoruz.",
  },
  {
    icon: ShieldCheck, // Yeni
    title: "Sürdürülebilir Finans",
    description:
      "Anlık harcamalardan ziyade uzun vadeli finansal sağlığınızı korumayı ve disiplinli bir gelecek inşa etmenizi hedefliyoruz.",
  },
  {
    icon: BadgeCheck,
    title: "Tam Şeffaflık",
    description:
      "Ürün sınırlarından veri işleme süreçlerine kadar her noktada açık ve dürüstüz. Sürprizlere yer vermeyen bir deneyim sunuyoruz.",
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
        {/* Hero Section */}
        <section
          className={`${aboutSectionBase} px-4 pb-16 pt-24 md:pb-20 md:pt-28`}
          aria-labelledby="about-hero-heading"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className={eyebrow}>Vizyonumuz</p>
            <h1
              id="about-hero-heading"
              className="mt-5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-tight"
            >
              Finansal geleceğinizi{" "}
              <span className="bg-linear-to-r from-emerald-600 via-emerald-500 to-emerald-400 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-400 dark:to-emerald-500">
                teknolojiyle
              </span>{" "}
              şekillendirin
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              IQfinansAI, modern dünyada finansal yönetimin sadece rakamlardan
              ibaret olmadığı inancıyla doğdu. Biz, parayı yönetmeyi bir stres
              kaynağı olmaktan çıkarıp bir strateji haline getiriyoruz.
            </p>
          </div>
        </section>

        {/* Mission & Product Section */}
        <section
          className={`${aboutSectionBase} px-4 py-16 md:py-24`}
          aria-labelledby="about-mission-heading"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
            <div>
              <h2
                id="about-mission-heading"
                className="text-2xl font-bold tracking-tight text-foreground md:text-3xl"
              >
                Neden IQfinansAI?
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground leading-relaxed md:text-lg">
                Geleneksel yöntemler artık günümüzün hızlı finansal dünyasına
                yetişemiyor. Banka dökümleri, kripto varlıklar, borçlar ve
                hedefler arasındaki bağ koptuğunda finansal stres başlar.
              </p>
              <p className="mt-4 text-pretty text-muted-foreground leading-relaxed md:text-lg">
                IQfinansAI, bu parçalı yapıyı tek bir zekâ altında toplar.
                Amacımız sadece veri saklamak değil, o veriyi sizin için{" "}
                <strong className="font-semibold text-foreground">
                  anlamlı bir yol haritasına
                </strong>{" "}
                dönüştürmektir.
              </p>
            </div>
            <Card className="border-border/80 bg-card/80 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">
                  Mühendislik Felsefemiz
                </CardTitle>
                <CardDescription>
                  Her satır kodda ve her tasarım kararında önceliğimiz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-sm text-muted-foreground leading-relaxed">
                <div className="flex gap-4">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                  </div>
                  <p>
                    <span className="font-semibold text-foreground">
                      Bütünleşik Ekosistem:
                    </span>{" "}
                    Harcamalarınız ile hedefleriniz arasındaki bağı kurarak
                    finansal sağlığınızı bir bütün olarak izleriz.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                  </div>
                  <p>
                    <span className="font-semibold text-foreground">
                      Veri Minimalizmi:
                    </span>{" "}
                    Sizi gereksiz detaylarla boğmaz, en doğru kararı vermeniz
                    için gereken kritik bilgiyi öne çıkarırız.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                  </div>
                  <p>
                    <span className="font-semibold text-foreground">
                      Etik AI:
                    </span>{" "}
                    Yapay zekâmız sizi yönlendirmez, size ayna tutar. Son karar
                    her zaman sizin özgür iradenizdedir.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values Grid */}
        <section
          className={`${aboutSectionBase} px-4 py-16 md:py-24`}
          aria-labelledby="about-values-heading"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className={eyebrow}>Değerlerimiz</p>
              <h2
                id="about-values-heading"
                className="mt-4 text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl"
              >
                İlkelerimizden ödün vermiyoruz
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground md:text-lg">
                Yola çıkarken belirlediğimiz bu temel taşlar, ürünün her bir
                pikselinde ve fonksiyonunda kendini hissettirir.
              </p>
            </div>

            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {values.map(({ icon: Icon, title, description }) => (
                <li key={title}>
                  <Card className="group h-full border-border/70 bg-background/80 transition-all hover:border-emerald-500/50 hover:shadow-lg">
                    <CardHeader className="pb-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white dark:text-emerald-400">
                        <Icon className="h-6 w-6" aria-hidden />
                      </div>
                      <CardTitle className="pt-4 text-lg">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-[15px] text-muted-foreground leading-relaxed">
                      {description}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className={`${aboutSectionBase} px-4 py-16 md:py-20`}
          aria-labelledby="about-cta-heading"
        >
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-3xl border border-emerald-500/20 bg-linear-to-b from-card/80 to-card/40 px-6 py-12 text-center shadow-2xl backdrop-blur-md md:px-16 md:py-16">
            <h2
              id="about-cta-heading"
              className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
            >
              Yeni nesil finans deneyimine katılın
            </h2>
            <p className="max-w-xl text-pretty text-muted-foreground md:text-lg">
              IQfinansAI ile tanışmak için en doğru zaman bugün. Kontrolü
              elinize alın, finansal geleceğinizi berraklaştırın.
            </p>
            <div className="mt-4 flex w-full flex-col items-stretch justify-center gap-4 sm:w-auto sm:flex-row sm:items-center">
              <Button
                size="lg"
                asChild
                className="rounded-full bg-emerald-600 px-10 font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-500 hover:scale-105"
              >
                <Link href="/kayit">
                  Hemen Başla
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="rounded-full px-10 border-emerald-500/20 hover:bg-emerald-500/5"
              >
                <Link href="/">Özellikleri İncele</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Creator Section */}
        <section
          className={`${aboutSectionBase} border-b-slate-300/55 px-4 py-20 dark:border-b-white/10 md:py-24`}
          aria-labelledby="about-team-heading"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="about-team-heading"
              className="text-2xl font-bold tracking-tight text-foreground md:text-3xl"
            >
              Geliştirici Notu
            </h2>
            <div className="mt-8 flex justify-center">
              <div className="h-1 w-12 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-8 text-pretty text-muted-foreground leading-relaxed md:text-lg italic">
              &quot;Finansal bağımsızlık sadece ne kadar kazandığınızla değil,
              sahip olduklarınızı ne kadar iyi yönettiğinizle ilgilidir.
              IQfinansAI&apos;yi bu yönetimi herkes için adil ve erişilebilir
              kılmak için inşa ediyorum.&quot;
            </p>
            <p className="mt-6 text-foreground font-medium">
              <a
                href="http://omerhalisdemir.com.tr/"
                className="text-emerald-600 underline-offset-4 transition hover:underline dark:text-emerald-400"
                rel="noopener noreferrer"
                target="_blank"
              >
                Ömer Halis Demir
              </a>
              <span className="block text-xs text-muted-foreground mt-1 uppercase tracking-widest font-normal">
                Full Stack Developer & Elektrik Elektronik Mühendisi
              </span>
            </p>
          </div>
        </section>
      </main>
      <LandingFooter />
    </LandingPageShell>
  );
}
