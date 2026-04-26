import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "IQfinansAI | Yapay Zeka Destekli Finans Yönetimi",
    template: "%s | IQfinansAI",
  },
  description:
    "IQfinansAI: gelir ve giderlerinizi tek panelden yönetin; borç, yatırım ve hedeflerinizi izleyin. Yapay zeka ile harcama özetleri ve içgörüler alın — finansınızı netleştirin.",

  applicationName: "IQfinansAI",
  authors: [
    {
      name: "Ömer Halis Demir",
      url: "http://omerhalisdemir.com.tr/",
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
    "döviz takibi",
    "portföy takibi",
    "yatırım portföyü",
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
      "IQfinansAI ile gelir ve giderlerinizi tek panelden yönetin; borç, yatırım ve hedeflerinizi izleyin. Yapay zeka ile harcama özetleri alın.",
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
      "Gelir ve giderlerinizi tek panelden yönetin; yapay zeka ile harcama içgörüleri alın.",
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
