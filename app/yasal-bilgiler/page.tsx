import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CerezPolitikasiContent } from "@/components/legal/content/cerez-politikasi-content";
import { GizlilikPolitikasiContent } from "@/components/legal/content/gizlilik-politikasi-content";
import { KullanimKosullariContent } from "@/components/legal/content/kullanim-kosullari-content";
import { MesafeliSatisContent } from "@/components/legal/content/mesafeli-satis-content";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { Separator } from "@/components/ui/separator";
import { getSiteUrl } from "@/lib/site/site-url";

const siteUrl = getSiteUrl();

const toc = [
  { id: "gizlilik-politikasi", label: "Gizlilik Politikası" },
  { id: "kullanim-kosullari", label: "Kullanım Koşulları" },
  { id: "mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi" },
  { id: "cerez-politikasi", label: "Çerez Politikası" },
] as const;

const sectionTitleClass =
  "text-balance !text-3xl font-bold tracking-tight text-foreground md:!text-[2rem] md:leading-tight lg:!text-[2.125rem]";

export const metadata: Metadata = {
  title: "Yasal bilgiler",
  description:
    "IQfinansAI gizlilik politikası, kullanım koşulları, mesafeli satış sözleşmesi ve çerez politikası.",
  alternates: {
    canonical: "/yasal-bilgiler",
    languages: { "tr-TR": "/yasal-bilgiler" },
  },
  openGraph: {
    title: "Yasal bilgiler | IQfinansAI",
    description:
      "Gizlilik, kullanım koşulları, mesafeli satış ve çerez politikası tek sayfada.",
    url: `${siteUrl}/yasal-bilgiler`,
    type: "website",
    locale: "tr_TR",
  },
  robots: { index: true, follow: true },
};

export default function YasalBilgilerPage() {
  return (
    <LegalPageLayout
      title="Yasal bilgiler"
      description="Aşağıda gizlilik, kullanım koşulları, mesafeli satış ve çerezlere ilişkin metinlere tek sayfadan ulaşabilirsiniz."
    >
      <nav
        aria-label="İçindekiler"
        className="not-prose overflow-hidden rounded-2xl border border-emerald-500/20 bg-linear-to-br from-card/95 via-card/90 to-muted/25 shadow-lg ring-1 ring-emerald-500/10 dark:from-card/90 dark:via-card/85 dark:to-muted/20"
      >
        <div className="border-b border-border/70 bg-muted/35 px-5 py-4 md:px-7 md:py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
            İçindekiler
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-foreground md:text-xl">
            Bu sayfadaki bölümler
          </p>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            İlgili metne doğrudan atlamak için bir başlık seçin.
          </p>
        </div>

        <ul className="m-0 list-none divide-y divide-border/70 p-0 pl-0! [&>li]:m-0 [&>li]:list-none [&>li]:pl-0">
          {toc.map(({ id, label }) => (
            <li key={id}>
              <Link
                href={`#${id}`}
                className="group flex items-center justify-between gap-4 px-5 py-4 text-[15px] font-medium text-foreground transition-colors hover:bg-emerald-500/[0.07] md:px-7 md:py-4.5 md:text-base"
              >
                <span className="min-w-0 text-pretty group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                  {label}
                </span>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-muted-foreground opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section id="gizlilik-politikasi" className="scroll-mt-28 pt-8 md:pt-10">
        <Separator className="mb-10 bg-border/60" />
        <h2 className={sectionTitleClass}>Gizlilik Politikası</h2>
        <p className="mt-3 max-w-3xl text-pretty text-base text-muted-foreground md:text-lg">
          Kişisel verilerinizin nasıl işlendiğini ve KVKK kapsamındaki
          haklarınızı özetler.
        </p>
        <div className="mt-10">
          <GizlilikPolitikasiContent />
        </div>
      </section>

      <section
        id="kullanim-kosullari"
        className="scroll-mt-28 mt-20 border-t border-border/70 pt-14 md:mt-24 md:pt-16"
      >
        <h2 className={sectionTitleClass}>Kullanım Koşulları</h2>
        <p className="mt-3 max-w-3xl text-pretty text-base text-muted-foreground md:text-lg">
          IQfinansAI hizmetini kullanırken uymanız gereken kurallar ve
          tarafların hakları.
        </p>
        <div className="mt-10">
          <KullanimKosullariContent />
        </div>
      </section>

      <section
        id="mesafeli-satis-sozlesmesi"
        className="scroll-mt-28 mt-20 border-t border-border/70 pt-14 md:mt-24 md:pt-16"
      >
        <h2 className={sectionTitleClass}>Mesafeli Satış Sözleşmesi</h2>
        <p className="mt-3 max-w-3xl text-pretty text-base text-muted-foreground md:text-lg">
          Tüketici mevzuatı çerçevesinde dijital hizmet alımına ilişkin
          bilgilendirme.
        </p>
        <div className="mt-10">
          <MesafeliSatisContent />
        </div>
      </section>

      <section
        id="cerez-politikasi"
        className="scroll-mt-28 mt-20 border-t border-border/70 pb-4 pt-14 md:mt-24 md:pt-16"
      >
        <h2 className={sectionTitleClass}>Çerez Politikası</h2>
        <p className="mt-3 max-w-3xl text-pretty text-base text-muted-foreground md:text-lg">
          Sitemizde ve uygulamamızda çerezlerin nasıl kullanıldığını öğrenin.
        </p>
        <div className="mt-10">
          <CerezPolitikasiContent />
        </div>
      </section>
    </LegalPageLayout>
  );
}
