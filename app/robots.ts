import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const PRIVATE_PREFIXES = [
  "/api/",
  "/dashboard",
  "/debts",
  "/budgets",
  "/goals",
  "/transactions",
  "/settings",
  "/investments",
  "/ai-insights",
  "/recurring",
  "/notifications",
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
