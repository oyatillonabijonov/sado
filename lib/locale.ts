import "server-only";
import { headers } from "next/headers";
import { DEFAULT_LOCALE, isSiteLocale, type SiteLocale } from "@/lib/i18n";

/**
 * So'rov qaysi tilda.
 *
 * `middleware.ts` `/ru/...` ni `/...` ga rewrite qiladi va `x-locale`
 * sarlavhasini qo'yadi; bu yerda o'sha o'qiladi. Sarlavha yo'q bo'lsa —
 * o'zbekcha.
 *
 * Kontent o'quvchilari (`lib/content.ts`, `lib/blog.ts`, …) tilni **o'zlari**
 * shu yerdan oladi, sahifalardan prop sifatida emas. Aks holda o'nga yaqin
 * chaqiruv joyining har biriga qo'lda `locale` uzatish kerak bo'lardi va
 * bittasi unutilsa o'sha blok jimgina o'zbekcha bo'lib qolardi.
 */
export async function currentLocale(): Promise<SiteLocale> {
  const value = (await headers()).get("x-locale");
  return isSiteLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * So'rovning manzili (til prefiksi bilan). `middleware.ts` qo'yadi —
 * `next/headers` da so'rov URL'i yo'q, `usePathname` esa client tomonda.
 * Til tugmasi va `hreflang` shundan quriladi.
 */
export async function currentPath(): Promise<string> {
  return (await headers()).get("x-pathname") ?? "/";
}
