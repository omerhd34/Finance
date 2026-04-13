import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@wrksz/themes/next";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FinansIQ · Bütçe, yatırım ve harcama takibi",
    template: "%s · FinansIQ",
  },
  description:
    "Gelir ve giderlerinizi tek panelden yönetin; borç, yatırım ve hedeflerinizi izleyin. Yapay zeka ile harcama özetleri ve içgörüler alın — finansınızı netleştirin.",
  keywords: [
    "bütçe",
    "gelir gider",
    "finans takibi",
    "harcama analizi",
    "yatırım",
    "FinansIQ",
  ],
  openGraph: {
    title: "FinansIQ · Bütçe, yatırım ve harcama takibi",
    description:
      "Gelir ve giderlerinizi tek panelden yönetin; borç, yatırım ve hedeflerinizi izleyin. Yapay zeka ile harcama özetleri alın.",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinansIQ · Bütçe, yatırım ve harcama takibi",
    description:
      "Gelir ve giderlerinizi tek panelden yönetin; yapay zeka ile harcama içgörüleri alın.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          themes={["light", "dark"]}
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
