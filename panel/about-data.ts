import "server-only";
import { payloadClient } from "@/panel/auth";
import { relId } from "@/panel/doc";
import { DEFAULT_LOCALE, type PanelLocale } from "@/panel/locale";

/**
 * «Biz haqimizda» formasining ma'lumoti.
 *
 * `RepeatRows` qatorlarni `Record<string, string>` sifatida chizadi, shuning
 * uchun surat ham **satr** bo'lib keladi: `photo: "12"` yoki `""`. Formadan
 * qaytganda `about-actions.ts` uni raqamga o'giradi.
 */

export type AboutFormData = {
  lead: string;
  story: string;
  mission: string;
  values: Record<string, string>[];
  team: Record<string, string>[];
  contactHeading: string;
  contactText: string;
};

export async function loadAbout(locale: PanelLocale = DEFAULT_LOCALE): Promise<AboutFormData> {
  const payload = await payloadClient();
  const doc = (await payload.findGlobal({
    slug: "about",
    depth: 0,
    locale,
    fallbackLocale: false,
  })) as unknown as Record<string, unknown>;
  const intro = (doc.intro ?? {}) as Record<string, unknown>;
  const contact = (doc.contact ?? {}) as Record<string, unknown>;

  return {
    lead: String(intro.lead ?? ""),
    story: String(intro.story ?? ""),
    mission: String(intro.mission ?? ""),
    contactHeading: String(contact.heading ?? ""),
    contactText: String(contact.text ?? ""),
    // `id` — usiz ikkinchi tildagi matn yo'qoladi.
    values: Array.isArray(doc.values)
      ? (doc.values as { id?: string | number; title?: string; text?: string }[]).map((v) => ({
          id: v.id == null ? "" : String(v.id),
          title: String(v.title ?? ""),
          text: String(v.text ?? ""),
        }))
      : [],
    team: Array.isArray(doc.team)
      ? (doc.team as { id?: string | number; name?: string; role?: string; photo?: unknown }[]).map(
          (m) => ({
            id: m.id == null ? "" : String(m.id),
            name: String(m.name ?? ""),
            role: String(m.role ?? ""),
            photo: relId(m.photo) === null ? "" : String(relId(m.photo)),
          }),
        )
      : [],
  };
}
