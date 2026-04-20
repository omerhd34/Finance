import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const PRIVATE_PREFIXES = [
  "/api/",
  "/gosterge-paneli",
  "/borc-ve-alacak",
  "/butceler",
  "/hedefler",
  "/islemler",
  "/ayarlar",
  "/yatirimlar",
  "/yapay-zeka-analizi",
  "/tekrarlayanlar",
  "/bildirimler",
] as const;

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...PRIVATE_PREFIXES],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
