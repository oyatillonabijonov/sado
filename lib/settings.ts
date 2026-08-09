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

const FALLBACK: SiteSettings = {
  heroKicker: `${site.tagline} — Toshkent, ${site.founded}-yildan`,
  heroHeading: "Brendlarning vizual ko'rinishini\nshakllantiramiz.",
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

  return {
    heroKicker: text(hero.kicker, FALLBACK.heroKicker),
    heroHeading: text(hero.heading, FALLBACK.heroHeading),
    email: text(contact.email, FALLBACK.email),
    phone: text(contact.phone, FALLBACK.phone),
    address: text(contact.address, FALLBACK.address),
    description: text(doc.description, FALLBACK.description),
    socials: socials.length ? socials : FALLBACK.socials,
  };
}

