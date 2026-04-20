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
      url: `${base}/hakkimizda`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/destek`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.72,
    },
  ];
}
