import type { Metadata } from "next";
import { GizlilikPolitikasiContent } from "@/components/legal/content/gizlilik-politikasi-content";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "IQfinansAI gizlilik politikası: kişisel verilerin işlenmesi, haklarınız ve iletişim.",
  alternates: {
    canonical: "/gizlilik-politikasi",
    languages: { "tr-TR": "/gizlilik-politikasi" },
  },
  openGraph: {
    title: "Gizlilik Politikası | IQfinansAI",
    description: "Kişisel verilerin korunması ve gizlilik ilkeleri.",
    url: `${siteUrl}/gizlilik-politikasi`,
    type: "website",
    locale: "tr_TR",
  },
  robots: { index: true, follow: true },
};

export default function GizlilikPolitikasiPage() {
  return (
    <LegalPageLayout
      title="Gizlilik Politikası"
      description="Kişisel verilerinizin nasıl işlendiğini ve KVKK kapsamındaki haklarınızı özetler."
    >
      <GizlilikPolitikasiContent />
    </LegalPageLayout>
  );
}
