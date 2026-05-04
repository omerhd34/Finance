import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SSSPosts, getPostBySlug } from "@/lib/site/sss-posts";
import { getSiteUrl } from "@/lib/site/site-url";

const siteUrl = getSiteUrl();

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SSSPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Konu bulunamadı" };
  }
  const url = `${siteUrl}/sss/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/sss/${post.slug}`,
      languages: { "tr-TR": `/sss/${post.slug}` },
    },
    openGraph: {
      title: `${post.title} | SSS | IQfinansAI`,
      description: post.description,
      url,
      type: "article",
      locale: "tr_TR",
    },
  };
}

export default async function SssTopicPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    inLanguage: "tr-TR",
    url: `${siteUrl}/sss/${post.slug}`,
    isPartOf: {
      "@type": "Blog",
      name: "IQfinansAI — Sık sorulan sorular",
      url: `${siteUrl}/sss`,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.qa.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer.join(" "),
      },
    })),
  };

  return (
    <LandingPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleJsonLd, faqJsonLd]),
        }}
      />
      <LandingHeader />
      <main className="flex-1 border-b border-slate-300/90 pb-20 pt-24 dark:border-white/10 md:pt-28">
        <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
          <article className="mx-auto max-w-5xl">
          <nav aria-label="SSS içi gezinme">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="-ml-2 mb-8 gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
            >
              <Link href="/sss">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                SSS listesine dön
              </Link>
            </Button>
          </nav>

          <header className="border-b border-border/80 pb-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-emerald-500/35 font-semibold text-emerald-700 dark:text-emerald-300"
              >
                {post.category}
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                {post.readingMinutes} dakika okuma
              </span>
            </div>
            <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl md:leading-tight">
              {post.title}
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              {post.description}
            </p>
          </header>

          <div
            className="mt-10 space-y-3 md:space-y-4"
            aria-label="Soru ve cevaplar"
          >
            {post.qa.map((item, i) => (
              <section
                key={i}
                className="rounded-xl border border-border/80 bg-card/80 px-4 py-3 shadow-sm md:px-5 md:py-4"
              >
                <h2 className="text-left text-sm font-semibold leading-snug text-foreground md:text-base">
                  {item.question}
                </h2>
                <div className="mt-3 space-y-3 border-t border-border/60 pt-3 text-[15px] leading-relaxed text-muted-foreground md:text-base">
                  {item.answer.map((paragraph, j) => (
                    <p key={j} className="text-pretty">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
        </div>
      </main>
      <LandingFooter />
    </LandingPageShell>
  );
}
