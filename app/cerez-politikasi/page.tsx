import type { Metadata } from "next";
import { CerezPolitikasiContent } from "@/components/legal/content/cerez-politikasi-content";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description:
    "IQfinansAI çerez politikası: çerez türleri, yönetim ve üçüncü taraflar.",
  alternates: {
    canonical: "/cerez-politikasi",
    languages: { "tr-TR": "/cerez-politikasi" },
  },
  openGraph: {
    title: "Çerez Politikası | IQfinansAI",
    description: "Çerez ve benzeri teknolojilerin kullanımı.",
    url: `${siteUrl}/cerez-politikasi`,
    type: "website",
    locale: "tr_TR",
  },
  robots: { index: true, follow: true },
};

export default function CerezPolitikasiPage() {
  return (
    <LegalPageLayout
      title="Çerez Politikası"
      description="Sitemizde ve uygulamamızda çerezlerin nasıl kullanıldığını öğrenin."
    >
      <CerezPolitikasiContent />
    </LegalPageLayout>
  );
}
