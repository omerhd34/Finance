import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
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
    ];
  },
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/FinansIQ-192.png" }];
  },
  images: {
    qualities: [75, 88],
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
