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
        logo: {
          "@type": "ImageObject",
          url: `${base}/FinansIQ-512.png`,
        },
        areaServed: {
          "@type": "Country",
          name: "Türkiye",
        },
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
        "@id": `${base}/#software`,
        name: "IQfinansAI",
        url: base,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "TRY",
          url: `${base}/kayit`,
        },
        description:
          "Kişisel finans ve bütçe yönetimi; yapay zeka destekli harcama analizi ve raporlama.",
        publisher: { "@id": `${base}/#organization` },
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
