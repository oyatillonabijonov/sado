import { getPayload } from "payload";
import config from "@payload-config";
import { about as FALLBACK } from "@/data/about";
import { team as FALLBACK_TEAM, values as FALLBACK_VALUES } from "@/data/team";

/**
 * «Biz haqimizda» sahifasining kontenti.
 *
 * Har bir maydonda zaxira bor va u **maydon darajasida** ishlaydi, hujjat
 * darajasida emas: mijoz faqat hikoyani yozib, jamoani keyinga qoldirsa,
 * jamoa kodagi ro'yxatdan chiqib turaveradi. Global umuman bo'sh bo'lsa
 * sahifa hozirgidek ko'rinadi — `db-ensure` yangi jadvalni bo'sh yaratadi,
 * ya'ni bu kod qo'shilgan deploy'dan keyingi birinchi daqiqada aynan shunday
 * bo'ladi.
 */

export type Value = { title: string; text: string };
export type Member = { name: string; role: string; photo?: string };

export type AboutContent = {
  lead: string;
  story: string;
  mission: string;
  values: Value[];
  team: Member[];
  contactHeading: string;
  contactText: string;
};

const text = (value: unknown, fallback: string) => {
  const v = String(value ?? "").trim();
  return v || fallback;
};

/** Upload maydoni `depth` ga qarab id yoki hujjat qaytaradi. */
const url = (value: unknown): string | undefined =>
  value && typeof value === "object" && "url" in value
    ? String((value as { url: string }).url)
    : undefined;

export async function getAbout(): Promise<AboutContent> {
  const payload = await getPayload({ config });
  const doc = (await payload
    .findGlobal({ slug: "about", depth: 1 })
    .catch(() => null)) as unknown as Record<string, unknown> | null;

  const intro = (doc?.intro ?? {}) as Record<string, unknown>;
  const contact = (doc?.contact ?? {}) as Record<string, unknown>;

  const values = Array.isArray(doc?.values)
    ? (doc.values as { title?: string; text?: string }[])
        .map((v) => ({ title: String(v.title ?? ""), text: String(v.text ?? "") }))
        .filter((v) => v.title && v.text)
    : [];

  const team = Array.isArray(doc?.team)
    ? (doc.team as { name?: string; role?: string; photo?: unknown }[])
        .map((m) => ({
          name: String(m.name ?? ""),
          role: String(m.role ?? ""),
          photo: url(m.photo),
        }))
        .filter((m) => m.name && m.role)
    : [];

  return {
    lead: text(intro.lead, FALLBACK.lead),
    story: text(intro.story, FALLBACK.story),
    mission: text(intro.mission, FALLBACK.mission),
    values: values.length ? values : FALLBACK_VALUES,
    team: team.length ? team : FALLBACK_TEAM,
    contactHeading: text(contact.heading, FALLBACK.contactHeading),
    contactText: text(contact.text, FALLBACK.contactText),
  };
}
