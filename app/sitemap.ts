import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { getAllPosts } from "@/lib/blog";
import { site } from "@/data/site";
import { localePath } from "@/lib/i18n";

/* Sahifalar kabi so'rov paytida: build bazani ko'rmaydi va statik sitemap
   Google'ga faqat beshta sahifadan iborat sayt ko'rsatardi. */
export const dynamic = "force-dynamic";

/**
 * Har bir sahifa ikki tilda.
 *
 * `alternates.languages` — juftlikni sitemap darajasida ham aytamiz: sahifa
 * `<link hreflang>` bilan ham beradi, lekin sitemap qidiruv tizimiga ikkala
 * versiyani sahifalarni ochmasdan turib ko'rsatadi.
 *
 * `getProjects()` va `getAllPosts()` so'rov tilida o'qiydi (sitemap uchun
 * bu o'zbekcha), lekin bizga faqat `slug` kerak — u lokalizatsiya
 * qilinmagan, ya'ni ikkala tilda bir xil.
 */
function entry(path: string, opts: { lastModified?: Date; priority: number; freq: "monthly" | "yearly" }) {
  return {
    url: `${site.url}${path}`,
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.freq,
    priority: opts.priority,
    alternates: {
      languages: {
        uz: `${site.url}${path}`,
        ru: `${site.url}${localePath("ru", path || "/")}`,
      },
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getAllPosts()]);

  return [
    ...["", "/portfolio", "/services", "/about", "/blog"].map((p) =>
      entry(p, { priority: p === "" ? 1 : 0.7, freq: "monthly" }),
    ),
    ...projects.map((p) => entry(`/portfolio/${p.slug}`, { priority: 0.6, freq: "yearly" })),
    ...posts.map((p) =>
      entry(`/blog/${p.slug}`, { lastModified: new Date(p.date), priority: 0.5, freq: "yearly" }),
    ),
  ];
}
