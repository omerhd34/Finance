import type { Metadata } from "next";

const siteUrl = process.env.NEXTAUTH_URL || "https://finansiq.com";

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "FinansIQ | Yapay Zeka Destekli Finans Yönetimi",
    template: "%s | FinansIQ",
  },
  description:
    "Gelir ve giderlerinizi tek panelden yönetin; borç, yatırım ve hedeflerinizi izleyin. Yapay zeka ile harcama özetleri ve içgörüler alın — finansınızı netleştirin.",

  applicationName: "FinansIQ",
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
    "FinansIQ",
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
    "Ömer Halis Demir",
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
    title: "FinansIQ | Yapay Zeka Destekli Finans Yönetimi",
    description:
      "Gelir ve giderlerinizi tek panelden yönetin; borç, yatırım ve hedeflerinizi izleyin. Yapay zeka ile harcama özetleri alın.",
    url: siteUrl,
    siteName: "FinansIQ",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/FinansIQ-1200.png",
        width: 1200,
        height: 630,
        alt: "FinansIQ Açılış Görseli",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "FinansIQ | Finansınızı Netleştirin",
    description:
      "Gelir ve giderlerinizi tek panelden yönetin; yapay zeka ile harcama içgörüleri alın.",
    images: ["/FinansIQ-1200.png"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/FinansIQ-16.png", sizes: "16x16", type: "image/png" },
      { url: "/FinansIQ-32.png", sizes: "32x32", type: "image/png" },
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
};
