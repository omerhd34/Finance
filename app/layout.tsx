import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { ThemeProvider } from "@wrksz/themes/next";
import { siteMetadata } from "@/lib/site/metadata";
import { Toaster } from "@/components/ui/sonner";
import { sidebarCollapsedBootstrapScript } from "@/lib/dashboard/sidebar-collapsed-bootstrap-script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
  preload: true,
  adjustFontFallback: true,
});

export const metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`dark ${geistSans.variable} h-full scroll-smooth antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.className} min-h-full flex flex-col bg-background text-foreground`}
      >
        <Script id="sidebar-collapsed-init" strategy="beforeInteractive">
          {sidebarCollapsedBootstrapScript()}
        </Script>
        <GoogleAnalytics />
        <MetaPixel />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          themes={["light", "dark"]}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
