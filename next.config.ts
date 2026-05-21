import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  experimental: {
    inlineCss: true,
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-slot",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "date-fns",
    ],
  },
  async redirects() {
    return [
      {
        source: "/gizlilik-politikasi",
        destination: "/yasal-bilgiler",
        permanent: true,
      },
      {
        source: "/kullanim-kosullari",
        destination: "/yasal-bilgiler",
        permanent: true,
      },
      {
        source: "/mesafeli-satis-sozlesmesi",
        destination: "/yasal-bilgiler",
        permanent: true,
      },
      {
        source: "/cerez-politikasi",
        destination: "/yasal-bilgiler",
        permanent: true,
      },
      {
        source: "/islemler/yeni-islem",
        destination: "/islemler",
        permanent: true,
      },
      {
        source: "/ayarlar",
        destination: "/profil",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/FinansIQ-192.png" }];
  },
  images: {
    qualities: [55, 65, 75, 88],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
