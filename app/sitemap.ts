import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  return [
    {
      url: `${base}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/register`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${base}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.55,
    },
  ];
}
