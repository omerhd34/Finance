import { getSiteUrl } from "@/lib/site-url";

export function LandingJsonLd() {
  const base = getSiteUrl();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "IQfinansAI",
        url: base,
        logo: `${base}/FinansIQ-512.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: "IQfinansAI",
        description:
          "Gelir ve giderlerinizi tek panelden yönetin; borç, yatırım ve hedeflerinizi izleyin. Yapay zeka ile harcama özetleri ve finansal içgörüler.",
        publisher: { "@id": `${base}/#organization` },
        inLanguage: "tr-TR",
      },
      {
        "@type": "SoftwareApplication",
        name: "IQfinansAI",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "TRY",
        },
        description:
          "Kişisel finans ve bütçe yönetimi; yapay zeka destekli harcama analizi ve raporlama.",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
