/**
 * schema.org sxemalarini yasovchi sof funksiyalar.
 *
 * Payload'ga TEGMAYDI — ma'lumot argument sifatida keladi. Sabab
 * `lib/site-format.ts` dagi bilan bir xil: bu yerdan qiymat import qilgan
 * client komponent butun Payload grafini bundle'ga tortardi.
 *
 * Sxemalar 2026-08-15 dagi SEO auditidan keyin qo'shildi — undan oldin
 * saytda bitta ham JSON-LD yo'q edi, ya'ni Google natijalarida boyitilgan
 * ko'rinish chiqmasdi va AI qidiruv tizimlari sahifani strukturasiz matn
 * sifatida o'qirdi.
 */
import { site } from "@/data/site";
import { localePath, type SiteLocale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/site-format";

/** Nisbiy yo'lni to'liq URL ga aylantiradi. Sxemada nisbiy yo'l ishlamaydi. */
export const abs = (path: string): string =>
  /^https?:\/\//.test(path) ? path : `${site.url}${path.startsWith("/") ? "" : "/"}${path}`;

/** Sahifaning tildagi to'liq manzili. */
export const pageUrl = (locale: SiteLocale, path: string): string =>
  abs(localePath(locale, path));

/**
 * Agentlikning o'zi — bosh sahifada.
 *
 * `logo` maxsus kvadrat PNG (`/images/logo.png`), `icon.svg` emas: Google
 * Organization logosi uchun rastrni ishonchli qabul qiladi, SVG bilan
 * hujjatlar aniq emas.
 */
export function organizationLd(settings: SiteSettings, locale: SiteLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: pageUrl(locale, "/"),
    logo: abs("/images/logo.png"),
    image: abs(locale === "ru" ? "/images/og-ru.png" : "/images/og-uz.png"),
    description: settings.description,
    email: settings.email,
    telephone: settings.phone,
    foundingDate: site.founded,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Toshkent",
      addressCountry: "UZ",
    },
    // Bo'sh massiv yubormaymiz: Google uni "ijtimoiy tarmoq yo'q" emas,
    // "maydon buzuq" deb o'qishi mumkin.
    ...(settings.socials.length ? { sameAs: settings.socials.map((s) => s.href) } : {}),
  };
}

/** Blog maqolasi. */
export function articleLd(
  post: { slug: string; title: string; description: string; date: string; cover: string; author: string },
  locale: SiteLocale,
) {
  const url = pageUrl(locale, `/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: abs(post.cover),
    datePublished: post.date,
    // Alohida `dateModified` maydonimiz yo'q — nashr sanasini takrorlaymiz.
    // Google ikkalasini ham kutadi va yo'qligi ogohlantirish beradi.
    dateModified: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: abs("/images/logo.png") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: locale,
    url,
  };
}

/**
 * Non ushoqlari — loyiha va maqola sahifalarida.
 *
 * `item` faqat oxirgisidan boshqasida bo'ladi: joriy sahifaning o'ziga
 * havola berish Google tavsiyasiga zid.
 */
export function breadcrumbLd(
  crumbs: { name: string; path: string }[],
  locale: SiteLocale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(i < crumbs.length - 1 ? { item: pageUrl(locale, c.path) } : {}),
    })),
  };
}
