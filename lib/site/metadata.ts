import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site/site-url";

const siteUrl = getSiteUrl();

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "IQfinansAI | Yapay Zeka Destekli Finans Yönetimi",
    template: "%s | IQfinansAI",
  },
  description:
    "IQfinansAI: gelir–gider, kategori bütçesi, borç–alacak ve tekrarlayan ödemeleri tek panelden yönetin; çoklu para birimi ve kur dönüşümü. Premium’da yapay zekâ analizi, fiş/fatura OCR ve yatırım portföyü — finansınızı netleştirin.",

  applicationName: "IQfinansAI",
  authors: [
    {
      name: "Ömer Halis Demir",
      url: "https://omerhalisdemir.com.tr/",
    },
  ],
  creator: "Ömer Halis Demir",
  publisher: "Ömer Halis Demir",
  generator: "Next.js",

  keywords: [
    "bütçe planlama",
    "gelir gider takibi",
    "kişisel finans",
    "harcama analizi",
    "yatırım yönetimi",
    "yapay zeka finans",
    "IQfinansAI",
    "iqfinansai.com",
    "para yönetimi",
    "borç yönetimi",
    "masraf takibi",
    "para biriktirme yolları",
    "tasarruf etme",
    "finansal özgürlük",
    "birikim hedefleri",
    "aile bütçesi",
    "akıllı bütçe asistanı",
    "otomatik harcama takibi",
    "ücretsiz bütçe uygulaması",
    "kişisel muhasebe programı",
    "harcama takip uygulaması",
    "online bütçe planlayıcı",
    "finans takip sitesi",
    "borç alacak takibi",
    "alacak verecek takibi",
    "abonelik takibi",
    "tekrarlayan ödemeler",
    "gelir gider tablosu",
    "nakit akışı",
    "çoklu para birimi",
    "kur dönüşüm",
    "döviz çevirici",
    "döviz takibi",
    "kategori bütçesi",
    "finansal sağlık skoru",
    "portföy takibi",
    "yatırım portföyü",
    "emtia yatırım",
    "kripto portföy",
    "finansal rapor",
    "harcama raporu",
    "ev ekonomisi",
    "ev bütçesi",
    "kredi kartı harcama takibi",
    "fiş okuma",
    "fatura tarama",
    "yapay zeka harcama analizi",
  ],

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/",
    },
  },

  openGraph: {
    title: "IQfinansAI | Yapay Zeka Destekli Finans Yönetimi",
    description:
      "Gelir–gider, bütçe ve borç–alacak; çoklu para birimi ve kur dönüşümü. Premium’da yapay zekâ analizi, OCR ve portföy — IQfinansAI.",
    url: siteUrl,
    siteName: "IQfinansAI",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/FinansIQ-1024.png",
        width: 1024,
        height: 630,
        alt: "IQfinansAI Açılış Görseli",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "IQfinansAI | Finansınızı Netleştirin",
    description:
      "Panel, bütçe ve borç–alacak takibi; kur dönüşümü. Premium’da yapay zekâ analizi ve OCR — IQfinansAI.",
    images: ["/FinansIQ-1024.png"],
  },

  icons: {
    icon: [
      { url: "/FinansIQ-192.png", sizes: "192x192", type: "image/png" },
      { url: "/FinansIQ-32.png", sizes: "32x32", type: "image/png" },
      { url: "/FinansIQ-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      {
        url: "/FinansIQ-apple-touch.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/FinansIQ-512.svg",
        color: "#10b981",
      },
    ],
  },

  manifest: "/site.webmanifest",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  ...(googleVerification
    ? {
        verification: {
          google: googleVerification,
        },
      }
    : {}),
};
