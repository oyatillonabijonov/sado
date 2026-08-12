import { getPayload } from "payload";
import config from "@payload-config";
import { currentLocale } from "@/lib/locale";

/**
 * «Biz haqimizda» sahifasining kontenti — **zaxirasiz**.
 *
 * Ilgari bu yerda `data/about.ts` va `data/team.ts` dagi qiymatlar zaxira
 * bo'lib turardi: global bo'sh bo'lsa sahifa o'sha matn bilan chiqardi.
 * Mijoz buni to'g'ri deb topmadi va haq edi — "Aziz Rahimov, kreativ
 * direktor" degan o'ylab topilgan odam saytda haqiqiy jamoa a'zosi bo'lib
 * turardi, va uni o'chirishning yo'li yo'q edi: paneldan jamoani bo'shatsang
 * kodagi olti kishi qaytib kelardi.
 *
 * Endi to'ldirilmagan joy **ko'rinmaydi**: bo'sh matn chizilmaydi, bo'sh
 * ro'yxat butun seksiyani yashiradi. Sahifa to'ldirilgunicha qisqa bo'lib
 * turadi — bu soxta ma'lumotdan yaxshiroq.
 *
 * `data/about.ts` va `data/team.ts` o'chirilmadi: ular `scripts/seed.ts`
 * uchun kerak, ya'ni bo'sh bazani boshlang'ich kontent bilan to'ldirish
 * yo'li ochiq qoladi.
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

const text = (value: unknown) => String(value ?? "").trim();

/** Upload maydoni `depth` ga qarab id yoki hujjat qaytaradi. */
const url = (value: unknown): string | undefined =>
  value && typeof value === "object" && "url" in value
    ? String((value as { url: string }).url)
    : undefined;

export async function getAbout(): Promise<AboutContent> {
  const payload = await getPayload({ config });
  const doc = (await payload
    .findGlobal({ slug: "about", depth: 1, locale: await currentLocale() })
    .catch(() => null)) as unknown as Record<string, unknown> | null;

  const intro = (doc?.intro ?? {}) as Record<string, unknown>;
  const contact = (doc?.contact ?? {}) as Record<string, unknown>;

  return {
    lead: text(intro.lead),
    story: text(intro.story),
    mission: text(intro.mission),
    contactHeading: text(contact.heading),
    contactText: text(contact.text),
    values: Array.isArray(doc?.values)
      ? (doc.values as { title?: string; text?: string }[])
          .map((v) => ({ title: text(v.title), text: text(v.text) }))
          .filter((v) => v.title || v.text)
      : [],
    team: Array.isArray(doc?.team)
      ? (doc.team as { name?: string; role?: string; photo?: unknown }[])
          .map((m) => ({ name: text(m.name), role: text(m.role), photo: url(m.photo) }))
          .filter((m) => m.name)
      : [],
  };
}
