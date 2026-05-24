import type { Metadata } from "next";
import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa6";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { Button } from "@/components/ui/button";
import { SupportContactForm } from "@/components/landing/support-contact-form";
import { cn } from "@/lib/common/utils";
import { getSiteUrl } from "@/lib/site/site-url";
import { SITE_FOUNDER } from "@/lib/site/founder";
import {
  SUPPORT_CONFIG,
  buildWhatsappHref,
  getSupportEmail,
  getSupportPhone,
  normalizePhoneForTel,
} from "@/lib/site/support-config";
import { Toaster } from "@/components/ui/sonner";

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

type ContactInfoItem = {
  id: string;
  label: string;
  value: string;
  href: string;
  icon: ReactElement;
  external?: boolean;
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
  gridClassName?: string;
};

const contactLinkClass =
  "group flex items-center gap-3 border-b border-border/60 px-4 py-4 transition hover:bg-emerald-500/5";
const contactIconClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 transition group-hover:bg-emerald-500/25 dark:text-emerald-400";
const contactValueClass =
  "mt-0.5 truncate text-[13px] font-semibold text-foreground transition group-hover:text-emerald-600 dark:group-hover:text-emerald-400";

export default function DestekPage() {
  const supportEmail = getSupportEmail();
  const supportPhone = getSupportPhone();
  const inboxConfigured = Boolean(supportEmail);
  const hasContactInfo = Boolean(supportEmail || supportPhone);

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

  const contactItems: ContactInfoItem[] = [];

  if (supportEmail) {
    contactItems.push({
      id: "email",
      label: "E-posta",
      value: supportEmail,
      href: `mailto:${supportEmail}`,
      icon: <Mail className="h-4 w-4" aria-hidden />,
    });
  }

  if (supportPhone) {
    contactItems.push(
      {
        id: "phone",
        label: "Telefon",
        value: supportPhone,
        href: `tel:${normalizePhoneForTel(supportPhone)}`,
        icon: <Phone className="h-4 w-4" aria-hidden />,
      },
      {
        id: "whatsapp",
        label: "WhatsApp",
        value: "Sohbet başlat",
        href: buildWhatsappHref(supportPhone),
        icon: <FaWhatsapp className="h-[18px] w-[18px]" aria-hidden />,
        external: true,
      },
    );
  }

  if (SUPPORT_CONFIG.location) {
    contactItems.push({
      id: "location",
      label: "Konum",
      value: SUPPORT_CONFIG.location,
      href: SUPPORT_CONFIG.locationMapUrl,
      icon: <MapPin className="h-4 w-4" aria-hidden />,
      external: true,
    });
  }

  if (SITE_FOUNDER.githubUrl) {
    contactItems.push({
      id: "github",
      label: "GitHub",
      value: SITE_FOUNDER.githubUrl
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, ""),
      href: SITE_FOUNDER.githubUrl,
      icon: <FaGithub className="h-[18px] w-[18px]" aria-hidden />,
      external: true,
    });
  }

  if (SITE_FOUNDER.linkedinUrl) {
    contactItems.push({
      id: "linkedin",
      label: "LinkedIn",
      value: SITE_FOUNDER.linkedinUrl
        .replace(/^https?:\/\/[^/]+/, "")
        .replace(/^\/in/, ""),
      href: SITE_FOUNDER.linkedinUrl,
      icon: <FaLinkedin className="h-[18px] w-[18px]" aria-hidden />,
      external: true,
    });
  }

  if (SITE_FOUNDER.cvUrl) {
    contactItems.push({
      id: "cv",
      label: "CV",
      value: "Özgeçmişi görüntüle",
      href: SITE_FOUNDER.cvUrl,
      icon: <FileText className="h-4 w-4" aria-hidden />,
      external: true,
    });
  }

  if (SITE_FOUNDER.personalSiteUrl) {
    contactItems.push({
      id: "personal-site",
      label: "Kişisel site",
      value: SITE_FOUNDER.personalSiteUrl
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, ""),
      href: SITE_FOUNDER.personalSiteUrl,
      icon: <ExternalLink className="h-4 w-4" aria-hidden />,
      external: true,
    });
  }

  contactItems.forEach((item, index) => {
    const isLeftColumn = index % 2 === 0;
    const isLast = index === contactItems.length - 1;
    const isOddTotal = contactItems.length % 2 === 1;
    const isInLastRow = isOddTotal ? isLast : index >= contactItems.length - 2;

    item.gridClassName = cn(
      item.gridClassName,
      isLeftColumn && !(isOddTotal && isLast) && "sm:border-r",
      isInLastRow && "border-b-0",
      isOddTotal && isLast && "sm:col-span-2",
    );
  });

  return (
    <LandingPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageJsonLd),
        }}
      />
      <LandingHeader />
      <Toaster />
      <main className="flex-1">
        <section
          className="border-b border-border/60 pb-14 pt-24 md:pb-20 md:pt-28"
          aria-labelledby="support-hero-heading"
        >
          <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
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
                sayfasına göz atın. Aradığınızı bulamazsanız aşağıdaki formu
                doldurabilir veya iletişim kanallarından doğrudan bana
                ulaşabilirsiniz.
              </p>
            </div>
          </div>
        </section>

        <section
          className="border-y border-border/50 bg-muted/30 py-12 md:py-16"
          aria-labelledby="support-contact-heading"
        >
          <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Mail className="h-6 w-6" aria-hidden />
              </div>
              <h2
                id="support-contact-heading"
                className="mt-4 text-xl font-bold tracking-tight text-foreground md:text-2xl"
              >
                İletişime geçin
              </h2>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                Formu doldurun veya doğrudan iletişim kanallarından bana ulaşın.
              </p>
            </div>
            <div
              className={
                hasContactInfo
                  ? "mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12"
                  : "mx-auto mt-10 max-w-3xl"
              }
            >
              {hasContactInfo ? (
                <aside
                  aria-label="İletişim bilgilerim"
                  className="flex flex-col"
                >
                  <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-emerald-500/20 bg-card/80 shadow-lg ring-1 ring-emerald-500/10 backdrop-blur-sm dark:bg-zinc-900/60">
                    <div className="flex items-center gap-4 border-b border-border/60 bg-linear-to-br from-emerald-500/10 via-transparent to-transparent px-5 py-4">
                      {SITE_FOUNDER.photoSrc ? (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 ring-2 ring-emerald-500/25">
                          <Image
                            src={SITE_FOUNDER.photoSrc}
                            alt={`${SITE_FOUNDER.displayName} — kurucu fotoğrafı`}
                            fill
                            className="object-cover object-top"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <div
                          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-linear-to-br from-emerald-600/30 to-emerald-950/50 text-base font-bold tracking-tight text-emerald-50 ring-2 ring-emerald-500/25"
                          aria-hidden
                        >
                          {SITE_FOUNDER.initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold tracking-tight text-foreground md:text-lg">
                          {SITE_FOUNDER.displayName}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground md:text-[11px]">
                          {SITE_FOUNDER.credentials}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-2.5">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </span>
                      <p className="text-xs font-medium text-muted-foreground md:text-sm">
                        <span className="font-semibold text-foreground">
                          Mesajlar açık
                        </span>{" "}
                        - {SUPPORT_CONFIG.responseTime}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      {contactItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          target={item.external ? "_blank" : undefined}
                          rel={
                            item.external ? "noopener noreferrer" : undefined
                          }
                          prefetch={item.external ? false : undefined}
                          className={cn(
                            contactLinkClass,
                            item.className,
                            item.gridClassName,
                          )}
                        >
                          <span
                            className={cn(contactIconClass, item.iconClassName)}
                          >
                            {item.icon}
                          </span>
                          <span className="flex min-w-0 flex-col">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                              {item.label}
                            </span>
                            <span
                              className={cn(
                                contactValueClass,
                                item.valueClassName,
                              )}
                            >
                              {item.value}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center gap-2.5 border-t border-border/60 bg-muted/30 px-5 py-2.5">
                      <Clock
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <p className="text-[11px] font-medium leading-snug text-muted-foreground md:text-xs">
                        <span className="font-semibold text-foreground">
                          Çalışma saatleri:
                        </span>{" "}
                        {SUPPORT_CONFIG.workingHours}
                      </p>
                    </div>
                  </div>
                </aside>
              ) : null}

              <div className="flex min-w-0 flex-col">
                <SupportContactForm
                  inboxConfigured={inboxConfigured}
                  className="max-w-none flex-1 [&>form]:h-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-t border-border/60 bg-linear-to-b from-emerald-500/5 to-transparent py-14 md:py-20"
          aria-labelledby="support-cta-heading"
        >
          <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-2xl border border-emerald-500/20 bg-card/60 px-6 py-10 text-center shadow-lg backdrop-blur-sm md:px-10 md:py-11">
              <h2
                id="support-cta-heading"
                className="text-balance text-xl font-bold tracking-tight text-foreground md:text-2xl"
              >
                Henüz hesabınız yok mu?
              </h2>
              <p className="text-pretty text-muted-foreground md:text-lg">
                Dakikalar içinde kayıt olun; bütçe ve harcamalarınızı
                düzenlemeye başlayın.
              </p>
              <Button
                size="lg"
                asChild
                className="rounded-full bg-emerald-700 px-8 font-semibold text-white shadow-md shadow-emerald-900/30 transition hover:bg-emerald-600 hover:shadow-lg dark:shadow-emerald-900/50"
              >
                <Link href="/kayit">
                  Kayıt ol
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </LandingPageShell>
  );
}
