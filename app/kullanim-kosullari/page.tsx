import type { Metadata } from "next";
import { KullanimKosullariContent } from "@/components/legal/content/kullanim-kosullari-content";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description:
    "IQfinansAI kullanım koşulları: hizmet kapsamı, hesap güvenliği ve yükümlülükler.",
  alternates: {
    canonical: "/kullanim-kosullari",
    languages: { "tr-TR": "/kullanim-kosullari" },
  },
  openGraph: {
    title: "Kullanım Koşulları | IQfinansAI",
    description: "Hizmeti kullanımınıza ilişkin kurallar ve sorumluluklar.",
    url: `${siteUrl}/kullanim-kosullari`,
    type: "website",
    locale: "tr_TR",
  },
  robots: { index: true, follow: true },
};

export default function KullanimKosullariPage() {
  return (
    <LegalPageLayout
      title="Kullanım Koşulları"
      description="IQfinansAI hizmetini kullanırken uymanız gereken kurallar ve tarafların hakları."
    >
      <KullanimKosullariContent />
    </LegalPageLayout>
  );
}
