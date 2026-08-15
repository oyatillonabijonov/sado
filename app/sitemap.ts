import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { getAllPosts } from "@/lib/blog";
import { site } from "@/data/site";
import { localePath } from "@/lib/i18n";

/* Sahifalar kabi so'rov paytida: build bazani ko'rmaydi va statik sitemap
   Google'ga faqat beshta sahifadan iborat sayt ko'rsatardi. */
export const dynamic = "force-dynamic";

/**
 * Har bir sahifa IKKI yozuv bilan chiqadi — o'zbekchasi va ruschasi.
 *
 * Ilgari `<loc>` faqat o'zbekcha edi, ruscha manzil esa faqat `alternate`
 * sifatida ko'rinardi. Google har til versiyasini o'z `<url>` yozuvi bilan
 * berishni tavsiya qiladi va shu tavsiyaga o'tildi (2026-08-15 SEO auditi):
 * eski holatda ruscha sahifalar indeksga sekinroq tushardi.
 *
 * `x-default` ham qo'shildi — ikkala tilga ham tegishli bo'lmagan
 * foydalanuvchi uchun. U o'zbekchaga ishora qiladi, chunki asosiy til shu.
 *
 * `getProjects()` va `getAllPosts()` so'rov tilida o'qiydi (sitemap uchun
 * bu o'zbekcha), lekin bizga faqat `slug` kerak — u lokalizatsiya
 * qilinmagan, ya'ni ikkala tilda bir xil.
 */
function entries(
  path: string,
  opts: { lastModified?: Date; priority: number; freq: "monthly" | "yearly" },
): MetadataRoute.Sitemap {
  const languages = {
    uz: `${site.url}${path}`,
    ru: `${site.url}${localePath("ru", path || "/")}`,
    "x-default": `${site.url}${path}`,
  };
  return [path, localePath("ru", path || "/")].map((p) => ({
    url: `${site.url}${p}`,
    // `lastModified` ATAYLAB shartli. Ilgari bu yerda `new Date()` turardi va
    // sitemap har so'rovda "hamma sahifa hozirgina o'zgardi" derdi — Google
    // bunday `lastmod` ga ishonishni to'xtatadi va haqiqatan yangilangan
    // sahifani ham e'tiborsiz qoldiradi. Sanani bilmasak, aytmaymiz.
    ...(opts.lastModified ? { lastModified: opts.lastModified } : {}),
    changeFrequency: opts.freq,
    priority: opts.priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getAllPosts()]);

  // Ro'yxat sahifalarining sanasi — eng yangi elementiniki. Bu haqiqiy
  // signal: yangi maqola chiqqanda `/blog` chindan o'zgargan bo'ladi.
  const newest = (dates: string[]): Date | undefined => {
    const times = dates.map((d) => new Date(d).getTime()).filter((t) => !Number.isNaN(t));
    return times.length ? new Date(Math.max(...times)) : undefined;
  };
  const newestPost = newest(posts.map((p) => p.date));

  return [
    ...entries("", { priority: 1, freq: "monthly" }),
    ...entries("/portfolio", { priority: 0.7, freq: "monthly" }),
    ...entries("/services", { priority: 0.7, freq: "monthly" }),
    ...entries("/about", { priority: 0.7, freq: "monthly" }),
    ...entries("/blog", { priority: 0.7, freq: "monthly", lastModified: newestPost }),
    // Loyihada sana maydoni yo'q (faqat `year`), shuning uchun `lastmod` ham yo'q.
    ...projects.flatMap((p) => entries(`/portfolio/${p.slug}`, { priority: 0.6, freq: "yearly" })),
    ...posts.flatMap((p) =>
      entries(`/blog/${p.slug}`, {
        lastModified: new Date(p.date),
        priority: 0.5,
        freq: "yearly",
      }),
    ),
  ];
}
