import type { MetadataRoute } from "next";
import { site } from "@/data/site";

/**
 * `/panel` va Payload REST API crawl'dan chiqarildi.
 *
 * Panel allaqachon `noindex, nofollow` bilan himoyalangan, ya'ni indeksga
 * tushmasdi — lekin crawler baribir u yerga kirib crawl budjetini sarflardi.
 *
 * `/api/media/file/` esa OCHIQ qoladi va bu SHART: loyiha muqovalari,
 * maqola rasmlari va panel orqali yuklangan hamma narsa shu yo'ldan
 * uzatiladi. Uni yopish Google Images'dan butun portfolioni olib tashlardi
 * va ijtimoiy tarmoqlardagi oldindan ko'rish rasmlarini ham sindirardi.
 * `Allow` aniqroq bo'lgani uchun `Disallow: /api/` ustidan yutadi.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/media/file/"],
      disallow: ["/panel", "/api/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
