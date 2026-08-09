import "server-only";
import { payloadClient } from "@/panel/auth";

export type SocialRow = { label: string; href: string };
export type SettingsFormData = {
  heroKicker: string;
  heroHeading: string;
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
    email: String(contact.email ?? ""),
    phone: String(contact.phone ?? ""),
    address: String(contact.address ?? ""),
    description: String(doc.description ?? ""),
    socials: Array.isArray(doc.socials)
      ? (doc.socials as SocialRow[]).map((s) => ({
          label: String(s.label ?? ""),
          href: String(s.href ?? ""),
        }))
      : [],
  };
}
