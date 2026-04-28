import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleHelp, Clock } from "lucide-react";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { sssPost } from "@/lib/sss-posts";
import { SSSPosts } from "@/lib/sss-posts";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

const eyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 ring-1 ring-emerald-500/20 dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";

function SssWideCard({ post }: { post: sssPost }) {
  return (
    <article>
      <Link
        href={`/sss/${post.slug}`}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-emerald-500/25 bg-linear-to-br from-emerald-500/10 via-card/90 to-card shadow-lg ring-1 ring-emerald-500/10 transition hover:border-emerald-500/40 hover:shadow-xl md:flex-row"
      >
        <div className="flex flex-1 flex-col justify-between p-6 sm:p-8 md:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-emerald-500/35 font-semibold text-emerald-700 dark:text-emerald-300"
              >
                {post.category}
              </Badge>
            </div>
            <h2 className="mt-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:max-w-xl">
              {post.title}
            </h2>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {post.description}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              {post.readingMinutes} dk okuma
            </span>
            <span className="ml-auto inline-flex items-center gap-1 font-semibold text-emerald-600 transition group-hover:gap-2 dark:text-emerald-400">
              Konuyu aç
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </div>
        <div
          className="relative min-h-[140px] border-t border-emerald-500/15 bg-muted/40 md:min-h-0 md:w-[38%] md:border-l md:border-t-0"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(16,185,129,0.2),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(45,212,191,0.12),transparent_50%)]" />
          <div className="relative flex h-full min-h-[140px] items-center justify-center p-8 md:min-h-[280px]">
            <div className="rounded-2xl border border-border/60 bg-card/80 px-6 py-4 text-center shadow-sm backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                {post.category.toLocaleUpperCase("tr-TR")}
              </p>
              <p className="mt-2 text-lg font-bold leading-snug text-foreground">
                {post.cardPreview}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

export const metadata: Metadata = {
  title: "SSS",
  description:
    "IQfinansAI sık sorulan sorular: hesap, panel, bütçe, Premium ve güvenlik konularında yanıtlar.",
  alternates: {
    canonical: "/sss",
    languages: { "tr-TR": "/sss" },
  },
  openGraph: {
    title: "SSS | IQfinansAI",
    description:
      "Ürün kullanımı, bütçe, borç ve Premium özellikleri hakkında sorular ve yanıtlar.",
    url: `${siteUrl}/sss`,
    type: "website",
    locale: "tr_TR",
  },
};

export default function SssIndexPage() {
  const categories = Array.from(new Set(SSSPosts.map((p) => p.category)));

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "IQfinansAI — Sık sorulan sorular",
    itemListElement: SSSPosts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/sss/${post.slug}`,
      name: post.title,
    })),
  };

  const sssBlogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "IQfinansAI — Sık sorulan sorular",
    description:
      "IQfinansAI kullanımıyla ilgili konu başlıklarına göre sık sorulan sorular ve yanıtlar.",
    url: `${siteUrl}/sss`,
    inLanguage: "tr-TR",
    publisher: {
      "@type": "Organization",
      name: "IQfinansAI",
      url: siteUrl,
    },
    blogPost: SSSPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: `${siteUrl}/sss/${post.slug}`,
      inLanguage: "tr-TR",
    })),
  };

  return (
    <LandingPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([sssBlogJsonLd, itemListJsonLd]),
        }}
      />
      <LandingHeader />
      <main className="flex-1">
        <section
          className="border-b border-border/60 px-4 pb-14 pt-24 md:pb-20 md:pt-28"
          aria-labelledby="sss-hero-heading"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className={eyebrow}>
              <CircleHelp
                className="mr-1.5 inline-block h-3.5 w-3.5 -translate-y-px opacity-90"
                aria-hidden
              />
              Sık sorulan sorular
            </p>
            <h1
              id="sss-hero-heading"
              className="mt-5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-tight"
            >
              IQfinansAI hakkında{" "}
              <span className="bg-linear-to-r from-emerald-600 via-emerald-500 to-emerald-400 bg-clip-text text-transparent dark:from-emerald-300 dark:via-emerald-400 dark:to-emerald-500">
                merak edilenler
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Hesap, gösterge paneli, işlemler, Premium ve güvenlik gibi
              başlıklarda kısa soru–cevap rehberleri. Bilgilendirme amaçlıdır;
              yatırım veya vergi tavsiyesi değildir.
            </p>
            <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="rounded-full border border-border/80 bg-card/90 px-3 py-1 text-[11px] font-semibold text-muted-foreground"
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <section
          className="px-4 py-12 md:py-16"
          aria-label="SSS konu başlıkları"
        >
          <div className="mx-auto max-w-5xl space-y-8 md:space-y-10">
            {SSSPosts.map((post) => (
              <SssWideCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <section
          className="border-t border-border/60 bg-linear-to-b from-emerald-500/5 to-transparent px-4 py-14 md:py-20"
          aria-labelledby="sss-cta-heading"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-2xl border border-emerald-500/20 bg-card/60 px-6 py-10 text-center shadow-lg backdrop-blur-sm md:px-10 md:py-11">
            <h2
              id="sss-cta-heading"
              className="text-balance text-xl font-bold tracking-tight text-foreground md:text-2xl"
            >
              Yanıtları pratiğe dökmek ister misiniz?
            </h2>
            <p className="text-pretty text-muted-foreground md:text-lg">
              Gelir ve giderlerinizi tek panelde toplayın; özetlerle
              alışkanlıklarınızı net görün.
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
