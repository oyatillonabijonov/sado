import { getPayload } from "payload";
import config from "@payload-config";
import { site } from "@/data/site";
import type { SiteSettings } from "@/lib/site-format";

export type { SiteSettings };

/**
 * Paneldan boshqariladigan sayt matnlari.
 *
 * `data/site.ts` butunlay yo'qolmadi: sayt nomi, manzili va navigatsiya
 * tuzilishi o'sha yerda qoladi — ular kontent emas. Bu yerda faqat mijoz
 * o'zgartiradigani, va har bir maydon uchun `data/site.ts` dagi qiymat
 * zaxira: global hali to'ldirilmagan bo'lsa ham sayt bo'sh chiqmaydi.
 */

/** Panelda hero rasmlari tanlanmasa ishlatiladigan standart rasmlar. */
/* WebP: bular fotosurat edi va PNG'da 1.4–2.1 MB tortardi (jami 6.8 MB).
   `next/image` baribir qayta siqadi, lekin manba og'ir bo'lsa Docker image
   ham, har bir sovuq optimizatsiya ham o'shancha qimmatga tushardi. */
const DEFAULT_HERO_IMAGES = ["/sd1.webp", "/sd2.webp", "/sd3.webp", "/sd4.webp", "/sd5.webp"];

const FALLBACK: SiteSettings = {
  heroKicker: `${site.tagline} — Toshkent, ${site.founded}-yildan`,
  heroHeading: "Brendlarning vizual ko'rinishini\nshakllantiramiz.",
  heroImages: DEFAULT_HERO_IMAGES,
  // Standart to'plamda tik kadr yo'q — bo'sh, ya'ni sayt desktop rasmlariga
  // qaytadi. Mijoz paneldan yuklaguncha telefonda hozirgidek qirqiladi.
  heroImagesMobile: [],
  email: site.email,
  phone: site.phone,
  address: site.address,
  description: site.description,
  socials: [...site.socials],
};

const text = (value: unknown, fallback: string) => {
  const v = String(value ?? "").trim();
  return v || fallback;
};

export async function getSettings(): Promise<SiteSettings> {
  const payload = await getPayload({ config });
  const doc = (await payload
    .findGlobal({ slug: "settings" })
    .catch(() => null)) as unknown as Record<string, unknown> | null;
  if (!doc) return FALLBACK;

  const hero = (doc.hero ?? {}) as Record<string, unknown>;
  const contact = (doc.contact ?? {}) as Record<string, unknown>;
  const socials = Array.isArray(doc.socials)
    ? (doc.socials as { label?: string; href?: string }[])
        .map((s) => ({ label: String(s.label ?? ""), href: String(s.href ?? "") }))
        .filter((s) => s.label && s.href)
    : [];

  // Ikkalasi ham upload hasMany: depth bilan populatsiya qilingan media obyektlari.
  const urls = (value: unknown) =>
    Array.isArray(value)
      ? (value as unknown[])
          .map((m) => (m && typeof m === "object" && "url" in m ? String((m as { url: string }).url) : ""))
          .filter(Boolean)
      : [];

  const heroImages = urls(doc.heroImages);

  return {
    heroKicker: text(hero.kicker, FALLBACK.heroKicker),
    heroHeading: text(hero.heading, FALLBACK.heroHeading),
    heroImages: heroImages.length ? heroImages : FALLBACK.heroImages,
    heroImagesMobile: urls(doc.heroImagesMobile),
    email: text(contact.email, FALLBACK.email),
    phone: text(contact.phone, FALLBACK.phone),
    address: text(contact.address, FALLBACK.address),
    description: text(doc.description, FALLBACK.description),
    socials: socials.length ? socials : FALLBACK.socials,
  };
}

