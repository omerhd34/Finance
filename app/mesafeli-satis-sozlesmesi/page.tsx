import type { Metadata } from "next";
import { MesafeliSatisContent } from "@/components/legal/content/mesafeli-satis-content";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description:
    "IQfinansAI mesafeli satış sözleşmesi: taraflar, cayma hakkı ve ödeme bilgileri.",
  alternates: {
    canonical: "/mesafeli-satis-sozlesmesi",
    languages: { "tr-TR": "/mesafeli-satis-sozlesmesi" },
  },
  openGraph: {
    title: "Mesafeli Satış Sözleşmesi | IQfinansAI",
    description: "Dijital hizmet satışına ilişkin mesafeli sözleşme metni.",
    url: `${siteUrl}/mesafeli-satis-sozlesmesi`,
    type: "website",
    locale: "tr_TR",
  },
  robots: { index: true, follow: true },
};

export default function MesafeliSatisPage() {
  return (
    <LegalPageLayout
      title="Mesafeli Satış Sözleşmesi"
      description="Tüketici mevzuatı çerçevesinde dijital hizmet alımına ilişkin bilgilendirme."
    >
      <MesafeliSatisContent />
    </LegalPageLayout>
  );
}
