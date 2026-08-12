import "server-only";
import { payloadClient } from "@/panel/auth";
import { relId, relIds } from "@/panel/doc";

export type SocialRow = { label: string; href: string };
export type StatRow = { value: string; label: string };
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

export async function loadSettings(): Promise<SettingsFormData> {
  const payload = await payloadClient();
  const doc = (await payload.findGlobal({ slug: "settings" })) as unknown as Record<
    string,
    unknown
  >;
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
    stats: Array.isArray(doc.stats)
      ? (doc.stats as StatRow[]).map((s) => ({
          value: String(s.value ?? ""),
          label: String(s.label ?? ""),
        }))
      : [],
    socials: Array.isArray(doc.socials)
      ? (doc.socials as SocialRow[]).map((s) => ({
          label: String(s.label ?? ""),
          href: String(s.href ?? ""),
        }))
      : [],
  };
}
