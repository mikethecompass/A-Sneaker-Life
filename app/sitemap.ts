import type { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity/client";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://a-sneaker-life.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [deals, releases] = await Promise.all([
    sanityClient
      .fetch<{ slug: { current: string }; _updatedAt?: string }[]>(
        `*[_type == "deal" && defined(slug.current) && !(_id in path("drafts.**"))] { slug, _updatedAt }`
      )
      .catch(() => []),
    sanityClient
      .fetch<{ slug: { current: string }; _updatedAt?: string }[]>(
        `*[_type == "release" && defined(slug.current) && !(_id in path("drafts.**"))] { slug, _updatedAt }`
      )
      .catch(() => []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/deals`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/releases`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/videos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  const dealRoutes: MetadataRoute.Sitemap = deals.map((d) => ({
    url: `${BASE_URL}/deals/${d.slug.current}`,
    lastModified: d._updatedAt ? new Date(d._updatedAt) : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const releaseRoutes: MetadataRoute.Sitemap = releases.map((r) => ({
    url: `${BASE_URL}/releases/${r.slug.current}`,
    lastModified: r._updatedAt ? new Date(r._updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...dealRoutes, ...releaseRoutes];
}
