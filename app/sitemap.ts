import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { getAllPosts } from "@/lib/blog";
import { site } from "@/data/site";

/* Sahifalar kabi so'rov paytida: build bazani ko'rmaydi va statik sitemap
   Google'ga faqat beshta sahifadan iborat sayt ko'rsatardi. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/portfolio", "/services", "/about", "/blog"].map(
    (p) => ({
      url: `${site.url}${p}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.7,
    })
  );
  const projectPages = (await getProjects()).map((p) => ({
    url: `${site.url}/portfolio/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
  const blogPages = (await getAllPosts()).map((p) => ({
    url: `${site.url}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));
  return [...staticPages, ...projectPages, ...blogPages];
}
