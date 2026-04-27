import type { MetadataRoute } from "next";
import { SSSPosts } from "@/lib/sss-posts";
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
      url: `${base}/sss`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...SSSPosts.map((post) => ({
      url: `${base}/sss/${post.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
    {
      url: `${base}/yasal-bilgiler`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.45,
    },
  ];
}
