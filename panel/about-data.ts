import "server-only";
import { payloadClient } from "@/panel/auth";
import { relId } from "@/panel/doc";

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

export async function loadAbout(): Promise<AboutFormData> {
  const payload = await payloadClient();
  const doc = (await payload.findGlobal({ slug: "about", depth: 0 })) as unknown as Record<
    string,
    unknown
  >;
  const intro = (doc.intro ?? {}) as Record<string, unknown>;
  const contact = (doc.contact ?? {}) as Record<string, unknown>;

  return {
    lead: String(intro.lead ?? ""),
    story: String(intro.story ?? ""),
    mission: String(intro.mission ?? ""),
    contactHeading: String(contact.heading ?? ""),
    contactText: String(contact.text ?? ""),
    values: Array.isArray(doc.values)
      ? (doc.values as { title?: string; text?: string }[]).map((v) => ({
          title: String(v.title ?? ""),
          text: String(v.text ?? ""),
        }))
      : [],
    team: Array.isArray(doc.team)
      ? (doc.team as { name?: string; role?: string; photo?: unknown }[]).map((m) => ({
          name: String(m.name ?? ""),
          role: String(m.role ?? ""),
          photo: relId(m.photo) === null ? "" : String(relId(m.photo)),
        }))
      : [],
  };
}
