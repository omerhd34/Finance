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
    "IQfinansAI destek merkezi: sık sorulan sorular, hesap ve güvenlik ipuçları, iletişim.",
  alternates: {
    canonical: "/destek",
    languages: { "tr-TR": "/destek" },
  },
  openGraph: {
    title: "Destek | IQfinansAI",
    description: "Sık sorulan sorular ve hesabınızla ilgili yardım kaynakları.",
    url: `${siteUrl}/destek`,
    type: "website",
    locale: "tr_TR",
  },
};

const eyebrow =
  "inline-flex items-center rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 ring-1 ring-emerald-500/20 dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/30";

const faqItems = [
  {
    q: "IQfinansAI ücretli mi?",
    a: "IQfinansAI'ye kayıt olmak ve temel özellikleri kullanmak tamamen ücretsizdir. Daha kapsamlı analizler, sınırsız kategori ve gelişmiş yapay zekâ içgörüleri sunan Premium planlarımız hakkında detaylı bilgiye 'Fiyatlandırma' sayfamızdan ulaşabilirsiniz.",
  },
  {
    q: "Altın, döviz, hisse senedi ve kripto verileri ne sıklıkla güncellenir?",
    a: "Yatırımlarınızın ve varlıklarınızın genel durumunu düzenli takip edebilmeniz için tüm piyasa verileri 60 dakikada bir periyodik olarak güncellenmektedir. Bu sayede portföy değerinizi güncel kurlar üzerinden izleyebilirsiniz.",
  },
  {
    q: "Banka hesaplarımı sisteme bağlayabilir miyim?",
    a: "Şu an için manuel veri girişi ve akıllı fiş/fatura tarama özelliğiyle hızlıca kayıt oluşturabilirsiniz. Banka entegrasyonları üzerindeki teknik çalışmalarımız ise devam ediyor.",
  },
  {
    q: "Verilerim ne kadar güvende ve nerede saklanıyor?",
    a: "Finansal verileriniz, endüstri standardı AES-256 şifreleme yöntemleri kullanılarak yüksek güvenlikli bulut altyapılarında saklanır. Verileriniz KVKK ve gizlilik ilkelerimize uygun olarak korunur; asla üçüncü taraflarla reklam veya pazarlama amacıyla paylaşılmaz.",
  },
  {
    q: "Yapay zekâ önerileri yatırım tavsiyesi midir?",
    a: "Hayır. IQfinansAI tarafından sunulan yapay zekâ analizleri; harcama alışkanlıklarınızı anlamanıza, tasarruf potansiyelinizi görmenize ve bütçe disiplini sağlamanıza yardımcı olmak için tasarlanmış istatistiksel içgörülerdir. Kesinlikle yatırım, vergi veya finansal danışmanlık yerine geçmez.",
  },
  {
    q: "Farklı para birimleriyle işlem yapabilir miyim?",
    a: "Evet. IQfinansAI; TL, Dolar (USD), Euro (EUR) ve Sterlin (GBP) para birimlerini tam olarak destekler. Gelir ve giderlerinizi bu birimlerle kaydedebilir, güncel kurlar üzerinden ana para biriminize dönüştürülmüş şekilde raporlayabilirsiniz.",
  },
  {
    q: "Hesabımı ve verilerimi istediğim zaman silebilir miyim?",
    a: "Kesinlikle. Kullanıcı panelindeki ayarlar bölümünden hesabınızı dilediğiniz an silebilirsiniz. Hesabınızı sildiğinizde, sistemimizde kayıtlı olan tüm finansal verileriniz ve kişisel bilgileriniz geri döndürülemez şekilde kalıcı olarak temizlenir.",
  },
  {
    q: "Destek taleplerime ne kadar sürede yanıt alırım?",
    a: "Bize ilettiğiniz tüm mesajlar teknik ekibimize doğrudan ulaşır. Genellikle iş günlerinde 24 saat içinde, yoğunluk durumuna bağlı olarak en geç 48 saat içerisinde geri dönüş sağlamaktayız.",
  },
  {
    q: "Şifremi unutursam ne yapmalıyım?",
    a: "Giriş sayfasında bulunan 'Şifremi Unuttum' bağlantısına tıklayarak, kayıtlı e-posta adresinize güvenli bir şifre sıfırlama bağlantısı gönderebilir ve hesabınıza saniyeler içinde tekrar erişim sağlayabilirsiniz.",
  },
] as const;

export default function DestekPage() {
  const inboxConfigured = Boolean(getSupportInboxEmail());

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Destek",
    description: "IQfinansAI destek merkezi ve sık sorulan sorular.",
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
          __html: JSON.stringify([webPageJsonLd, faqJsonLd]),
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
              Sık sorulan sorular çoğu konuda yol gösterir. Aradığınızı
              bulamazsanız sayfanın altındaki formdan bize yazınız.
            </p>
          </div>
        </section>

        <section
          className="px-4 py-14 md:py-24"
          aria-labelledby="support-faq-heading"
          id="sss"
        >
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className={eyebrow}>SSS</p>
              <h2
                id="support-faq-heading"
                className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl"
              >
                Sık sorulan sorular
              </h2>
            </div>

            <div className="mt-10 space-y-3">
              {faqItems.map(({ q, a }) => (
                <details
                  key={q}
                  className="group rounded-xl border border-border/80 bg-card/80 px-4 py-3 shadow-sm open:shadow-md transition-shadow md:px-5"
                >
                  <summary className="cursor-pointer list-none font-medium text-foreground outline-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-left text-sm md:text-base">
                        {q}
                      </span>
                      <span className="shrink-0 text-muted-foreground transition group-open:rotate-180">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 border-t border-border/60 pt-3 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                    {a}
                  </p>
                </details>
              ))}
            </div>
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
                Ücretsiz başla
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
