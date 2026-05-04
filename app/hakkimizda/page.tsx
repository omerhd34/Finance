import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Code2,
  HeartHandshake,
  LineChart,
  Lock,
  Sparkles,
  Target,
  Zap,
  Shapes,
  ShieldCheck,
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
import { cn } from "@/lib/common/utils";
import { SITE_FOUNDER } from "@/lib/site/founder";
import { getSiteUrl } from "@/lib/site/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "IQfinansAI’nin misyonu, değerleri ve kişisel finansınızı netleştirmek için benimsediğim modern yaklaşım.",
  alternates: {
    canonical: "/hakkimizda",
    languages: { "tr-TR": "/hakkimizda" },
  },
  openGraph: {
    title: "Hakkımızda | IQfinansAI",
    description:
      "Finansal özgürlüğe giden yolu teknolojiyle sadeleştiriyorum. Değerlerim ve vizyonum hakkında bilgi edinin.",
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
      "Karmaşık tabloların gürültüsünü siliyor; sadece ihtiyaç duyduğunuz veriyi, en sade ve anlaşılır haliyle sunuyorum.",
  },
  {
    icon: Lock,
    title: "Sarsılmaz Güvenlik",
    description:
      "Verileriniz en değerli varlığınızdır. Banka düzeyinde koruma standartları ve şeffaf gizlilik politikalarıyla hareket ediyorum.",
  },
  {
    icon: Sparkles,
    title: "Zekice İçgörüler",
    description:
      "Yapay zekayı sadece bir araç olarak değil; kararlarınızı güçlendiren, gizli kalmış detayları fark eden bir asistan olarak konumluyorum.",
  },
  {
    icon: Shapes,
    title: "Bütünsel Bakış",
    description:
      "Bütçe, borç ve yatırımı birbirinden ayırmıyorum. Paranızın tüm parçalarını tek bir büyük resimde birleştiriyorum.",
  },
  {
    icon: Zap,
    title: "Zaman Verimliliği",
    description:
      "Finans yönetimi bir iş yükü olmamalı. Otomasyon yetenekleriyle manuel veri girişini azaltıp size zaman kazandırıyorum.",
  },
  {
    icon: HeartHandshake,
    title: "Topluluk Odaklılık",
    description:
      "Gelişimi doğrudan kullanıcı geri bildirimleriyle şekillendiriyor, gerçek ihtiyaçlara çözüm üreten bir yapı kuruyorum.",
  },
  {
    icon: LineChart,
    title: "Sürekli İnovasyon",
    description:
      "Finansal teknolojiler hızla değişiyor; her gün yeni algoritmalar ve özelliklerle bu değişime ayak uyduruyorum.",
  },
  {
    icon: ShieldCheck,
    title: "Sürdürülebilir Finans",
    description:
      "Anlık harcamalardan ziyade uzun vadeli finansal sağlığınızı korumayı ve disiplinli bir gelecek inşa etmenizi hedefliyorum.",
  },
  {
    icon: BadgeCheck,
    title: "Tam Şeffaflık",
    description:
      "Ürün sınırlarından veri işleme süreçlerine kadar her noktada açık ve dürüstüm. Sürprizlere yer vermeyen bir deneyim sunuyorum.",
  },
] as const;

type TechStackChip = { label: string; href: string };

type TechStackGroup = {
  id: string;
  title: string;
  chips: readonly TechStackChip[];
};

const techStackChipClassName =
  "inline-flex max-w-full rounded-md border border-border/80 bg-muted/50 px-2.5 py-1 text-left text-xs font-medium text-pretty text-foreground underline-offset-2 wrap-break-word transition hover:border-emerald-500/45 hover:text-emerald-700 dark:hover:text-emerald-300";

const featuredTechStackLabels = new Set([
  "Next.js (App Router)",
  "Tailwind CSS",
  "TypeScript",
  "Node.js",
  "MySQL",
  "Google Gemini API",
  "Redux Toolkit",
  "Shopier",
  "CollectAPI",
  "ixirhost | İksir İnternet Hizmetleri A.Ş.",
  "Teknik SEO",
  "NextAuth.js",
  "bcrypt",
]);

const techStackChipFeaturedClassName =
  "border-emerald-500/50 bg-emerald-500/14 text-emerald-950 hover:border-emerald-600/60 hover:bg-emerald-500/22 hover:text-emerald-950 dark:border-emerald-400/45 dark:bg-emerald-400/14 dark:text-emerald-50 dark:hover:border-emerald-300/55 dark:hover:bg-emerald-400/22 dark:hover:text-emerald-50";

const techStackGroups: readonly TechStackGroup[] = [
  {
    id: "frontend",
    title: "Ön uç ve tasarım (Frontend)",
    chips: [
      { label: "Next.js (App Router)", href: "https://nextjs.org/" },
      { label: "React", href: "https://react.dev/" },
      { label: "TypeScript", href: "https://www.typescriptlang.org/" },
      { label: "Tailwind CSS", href: "https://tailwindcss.com/" },
      { label: "shadcn/ui", href: "https://ui.shadcn.com/" },
      { label: "Radix UI", href: "https://www.radix-ui.com/" },
    ],
  },
  {
    id: "runtime-data",
    title: "Çalışma zamanı ve veri (Backend)",
    chips: [
      { label: "Node.js", href: "https://nodejs.org/" },
      { label: "Prisma", href: "https://www.prisma.io/" },
      { label: "MySQL", href: "https://www.mysql.com/" },
      { label: "Vercel", href: "https://vercel.com/" },
      { label: "Railway", href: "https://railway.app/" },
    ],
  },
  {
    id: "auth",
    title: "Oturum ve güvenlik",
    chips: [
      { label: "NextAuth.js", href: "https://authjs.dev/" },
      { label: "bcrypt", href: "https://www.npmjs.com/package/bcryptjs" },
    ],
  },
  {
    id: "ai-forms-state",
    title: "Yapay zekâ (AI), doğrulama ve durum",
    chips: [
      { label: "Google Gemini API", href: "https://ai.google.dev/gemini-api" },
      { label: "Zod", href: "https://zod.dev/" },
      { label: "React Hook Form", href: "https://react-hook-form.com/" },
      { label: "Redux Toolkit", href: "https://redux-toolkit.js.org/" },
    ],
  },
  {
    id: "integrations",
    title: "Ödeme ve piyasa verisi",
    chips: [
      {
        label: "Shopier",
        href: "https://www.shopier.com/iqfinansai/46432141",
      },
      { label: "CollectAPI", href: "https://collectapi.com/" },
    ],
  },
  {
    id: "seo-analytics-hosting",
    title: "SEO, arama, analitik, reklam ve alan adı",
    chips: [
      {
        label: "Teknik SEO",
        href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
      },
      {
        label: "Google Search Console",
        href: "https://search.google.com/search-console/about",
      },
      {
        label: "Google Analytics",
        href: "https://marketingplatform.google.com/about/analytics/",
      },
      {
        label: "Meta Ads Manager (Instagram)",
        href: "https://adsmanager.facebook.com/",
      },
      {
        label: "ixirhost | İksir İnternet Hizmetleri A.Ş.",
        href: "https://www.ixirhost.com/",
      },
    ],
  },
];

export default function HakkimizdaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Hakkımızda",
    description:
      "IQfinansAI hakkında misyon, değerler ve ürün yaklaşımı; tek geliştirici perspektifiyle hazırlanmış bilgiler.",
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
          className={`${aboutSectionBase} pb-16 pt-24 md:pb-20 md:pt-28`}
          aria-labelledby="about-hero-heading"
        >
          <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
            <div className="mx-auto max-w-3xl text-center">
              <p className={eyebrow}>Vizyonum</p>
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
                ibaret olmadığı inancıyla doğdu. Parayı yönetmeyi bir stres
                kaynağı olmaktan çıkarıp bir strateji haline getirmeyi
                hedefliyorum.
              </p>
            </div>
          </div>
        </section>

        <section
          className="border-b border-slate-200/45 bg-linear-to-b from-slate-50 via-white to-slate-50 py-16 dark:border-zinc-800/45 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 md:py-24"
          aria-labelledby="about-founder-heading"
        >
          <div className="mx-auto w-full max-w-5xl px-4 xl:px-0">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/15 bg-card/90 p-8 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18)] ring-1 ring-emerald-500/10 backdrop-blur-sm dark:border-emerald-400/10 dark:bg-zinc-900/70 dark:shadow-black/40 dark:ring-white/5 md:p-10 lg:p-12">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15"
                aria-hidden
              />
              <div className="relative flex flex-col items-center gap-10 md:flex-row md:items-center md:gap-14 lg:gap-16">
                {SITE_FOUNDER.photoSrc ? (
                  <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-emerald-950/25 ring-2 ring-emerald-500/20 md:h-48 md:w-48">
                    <Image
                      src={SITE_FOUNDER.photoSrc}
                      alt={
                        SITE_FOUNDER.displayName.trim()
                          ? `${SITE_FOUNDER.displayName.trim()} — kurucu fotoğrafı`
                          : "Kurucu fotoğrafı"
                      }
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 160px, 192px"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-40 w-40 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/25 bg-linear-to-br from-emerald-600/30 to-emerald-950/50 text-3xl font-bold tracking-tight text-emerald-50 shadow-2xl ring-2 ring-emerald-500/25 md:h-48 md:w-48 md:text-4xl"
                    aria-hidden
                  >
                    {SITE_FOUNDER.initials}
                  </div>
                )}
                <div className="min-w-0 flex-1 text-center md:text-left">
                  <div className="inline-flex flex-col items-center md:items-start">
                    <p className={eyebrow}>Kurucu & Geliştirici</p>
                    <span
                      className="mt-4 inline-block h-1 w-35 rounded-full bg-linear-to-r from-emerald-500 to-emerald-400"
                      aria-hidden
                    />
                  </div>
                  <blockquote
                    id="about-founder-heading"
                    className="mt-8 border-l-[3px] border-emerald-500/50 pl-5 text-pretty text-base font-light italic leading-[1.75] text-muted-foreground md:border-l-4 md:pl-6 md:text-lg md:leading-relaxed"
                  >
                    &ldquo;{SITE_FOUNDER.quote}&rdquo;
                  </blockquote>
                  <div className="mt-8 space-y-2">
                    <Link
                      href={SITE_FOUNDER.personalSiteUrl}
                      prefetch={false}
                      className="inline-block text-xl font-semibold tracking-tight text-emerald-600 underline-offset-[6px] transition hover:underline dark:text-emerald-400"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {SITE_FOUNDER.displayName}
                    </Link>
                    <p className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground md:text-xs">
                      {SITE_FOUNDER.credentials}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`${aboutSectionBase} py-16 md:py-24`}
          aria-labelledby="about-mission-heading"
        >
          <div className="mx-auto grid w-full max-w-7xl px-4 xl:px-0 gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
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
                Amacım sadece veri saklamak değil, o veriyi sizin için{" "}
                <strong className="font-semibold text-foreground">
                  anlamlı bir yol haritasına
                </strong>{" "}
                dönüştürmektir.
              </p>
            </div>
            <Card className="border-border/80 bg-card/80 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Mühendislik Felsefem</CardTitle>
                <CardDescription>
                  Her satır kodda ve her tasarım kararında önceliğim
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
                    finansal sağlığınızı bir bütün olarak izlerim.
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
                    için gereken kritik bilgiyi öne çıkarırım.
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
                    Üründeki yapay zekâ sizi yönlendirmez, size ayna tutar. Son
                    karar her zaman sizin özgür iradenizdedir.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section
          className={`${aboutSectionBase} py-16 md:py-24`}
          aria-labelledby="about-values-heading"
        >
          <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
            <div className="mx-auto max-w-2xl text-center">
              <p className={eyebrow}>Değerlerim</p>
              <h2
                id="about-values-heading"
                className="mt-4 text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl"
              >
                İlkelerimden ödün vermiyorum
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground md:text-lg">
                Yola çıkarken belirlediğim bu temel taşlar, ürünün her bir
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

        <section
          className={`${aboutSectionBase} py-16 md:py-20`}
          aria-labelledby="about-cta-heading"
        >
          <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
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
          </div>
        </section>

        <section
          className={`${aboutSectionBase} relative overflow-hidden py-16 md:py-24`}
          aria-labelledby="about-stack-heading"
        >
          <div
            className="absolute left-1/2 top-1/2 -z-10 h-120 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[100px] dark:bg-emerald-500/10"
            aria-hidden="true"
          />

          <div className="mx-auto w-full max-w-7xl px-4 xl:px-0 relative z-10">
            <div className="mx-auto max-w-6xl text-center">
              <p className={eyebrow}>
                <Code2
                  className="mr-1.5 inline-block h-3.5 w-3.5 align-[-0.125em] opacity-90"
                  aria-hidden
                />
                Teknoloji yığını
              </p>
              <h2
                id="about-stack-heading"
                className="mt-5 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl"
              >
                Site neyle kuruldu?
              </h2>
              <div className="mt-6 space-y-5 text-pretty text-muted-foreground md:text-lg md:leading-relaxed">
                <p>
                  Finans verisi taşıyan bir üründe, hangi katmanların bir arada
                  çalıştığını gizlemek yerine{" "}
                  <span className="font-semibold text-foreground">
                    açıkça paylaşmayı
                  </span>{" "}
                  doğru buluyorum: böylece hem güven hem de &quot;bu sistem
                  sürdürülebilir mi?&quot; sorusuna net bir çerçeve çiziliyor.
                </p>
                <p>
                  Aşağıdaki kartlarda araçları{" "}
                  <span className="font-semibold text-foreground">
                    tek tek sıralamak
                  </span>{" "}
                  yerine, ön uçtan veri tabanına, ödemeden piyasa beslemesine
                  kadar{" "}
                  <span className="font-semibold text-foreground">
                    hangi işin nerede çözüldüğünü
                  </span>{" "}
                  grupladım. Merak ettiğiniz bir satır olursa ilgili karttan
                  gidebilir; burada amaç liste atmak değil, mimariyi anlaşılır
                  kılmak.
                </p>
              </div>
            </div>

            <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {techStackGroups.map((group) => (
                <li key={group.id} className="group relative">
                  <div
                    className="absolute -inset-0.5 rounded-2xl bg-linear-to-br from-emerald-500/20 to-transparent opacity-0 blur transition duration-500 group-hover:opacity-100 dark:from-emerald-400/15"
                    aria-hidden="true"
                  />
                  <Card className="relative h-full overflow-hidden border-border/50 bg-background/60 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 dark:bg-zinc-950/60 dark:hover:border-emerald-500/30">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-semibold tracking-tight text-foreground/90">
                        {group.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2.5 pt-0">
                      {group.chips.map((chip) => {
                        const isFeatured = featuredTechStackLabels.has(
                          chip.label,
                        );
                        return (
                          <Link
                            key={`${group.id}-${chip.label}`}
                            href={chip.href}
                            prefetch={false}
                            className={cn(
                              techStackChipClassName,
                              "transition-transform duration-200 hover:-translate-y-0.5",
                              isFeatured && techStackChipFeaturedClassName,
                            )}
                            rel="noopener noreferrer"
                            target="_blank"
                            title={`${chip.label} — resmi site`}
                          >
                            {chip.label}
                          </Link>
                        );
                      })}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <LandingFooter />
    </LandingPageShell>
  );
}
