import "server-only";
import { payloadClient } from "@/panel/auth";
import { relId, relIds } from "@/panel/doc";
import { DEFAULT_LOCALE, type PanelLocale } from "@/panel/locale";

export type SocialRow = { id?: string; label: string; href: string };
export type StatRow = { id?: string; value: string; label: string };
export type SettingsFormData = {
  stats: StatRow[];
  heroKicker: string;
  heroHeading: string;
  heroImages: number[];
  heroImagesMobile: number[];
  servicesCover: number | null;
  email: string;
  phone: string;
  address: string;
  description: string;
  socials: SocialRow[];
};

export async function loadSettings(
  locale: PanelLocale = DEFAULT_LOCALE,
): Promise<SettingsFormData> {
  const payload = await payloadClient();
  // `fallbackLocale: false` — ruscha ekranda mijoz o'zi yozganini ko'rsin.
  const doc = (await payload.findGlobal({
    slug: "settings",
    locale,
    fallbackLocale: false,
  })) as unknown as Record<string, unknown>;
  const hero = (doc.hero ?? {}) as Record<string, unknown>;
  const contact = (doc.contact ?? {}) as Record<string, unknown>;

  return {
    heroKicker: String(hero.kicker ?? ""),
    heroHeading: String(hero.heading ?? ""),
    heroImages: relIds(doc.heroImages),
    heroImagesMobile: relIds(doc.heroImagesMobile),
    servicesCover: relId(doc.servicesCover),
    email: String(contact.email ?? ""),
    phone: String(contact.phone ?? ""),
    address: String(contact.address ?? ""),
    description: String(doc.description ?? ""),
    // `id` — Payload qator identifikatori; usiz ikkinchi tildagi yorliq yo'qoladi.
    stats: Array.isArray(doc.stats)
      ? (doc.stats as (StatRow & { id?: string | number })[]).map((s) => ({
          id: s.id == null ? "" : String(s.id),
          value: String(s.value ?? ""),
          label: String(s.label ?? ""),
        }))
      : [],
    socials: Array.isArray(doc.socials)
      ? (doc.socials as (SocialRow & { id?: string | number })[]).map((s) => ({
          id: s.id == null ? "" : String(s.id),
          label: String(s.label ?? ""),
          href: String(s.href ?? ""),
        }))
      : [],
  };
}
