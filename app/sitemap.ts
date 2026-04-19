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
    {
      url: `${base}/gizlilik-politikasi`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.45,
    },
    {
      url: `${base}/kullanim-kosullari`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.45,
    },
    {
      url: `${base}/mesafeli-satis-sozlesmesi`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.42,
    },
    {
      url: `${base}/cerez-politikasi`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.42,
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
