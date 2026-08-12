"use server";

import { revalidatePath } from "next/cache";
import { payloadClient, requireUser } from "@/panel/auth";
import { DEFAULT_LOCALE, type PanelLocale } from "@/panel/locale";
import { readRows, rowId } from "@/panel/rows";
import { explain, type FormState } from "@/panel/form-state";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function saveAbout(
  locale: PanelLocale,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireUser();
  const primary = locale === DEFAULT_LOCALE;

  // `id` — usiz ikkinchi tildagi matn yo'qoladi (o'lchangan).
  const values = readRows(fd, "values", ["title", "text"]).map((v) => ({
    id: rowId(v),
    title: v.title,
    text: v.text,
  }));
  // Surat ixtiyoriy: suratsiz a'zo saytda bosh harflari bilan chiqadi.
  //
  // Ism va surat lokalizatsiya qilinmagan, lekin ular baribir **har ikkala
  // tildan ham** yoziladi. Massiv qatorida maydonni tashlab ketish uni
  // o'chirmaydi — qator berilgan obyekt bilan almashtiriladi, ya'ni `name`
  // siz yuborilgan qator ismni yo'qotardi (`required` xatosi yoki `null`).
  // Qiymat ikkala tilda bir xil bo'lgani uchun qayta yozish zararsiz.
  const team = readRows(fd, "team", ["name", "role", "photo"], ["photo"]).map((m) => ({
    id: rowId(m),
    name: m.name,
    role: m.role,
    photo: Number(m.photo) || null,
  }));

  try {
    const payload = await payloadClient();
    await payload.updateGlobal({
      slug: "about",
      locale,
      data: {
        intro: {
          lead: str(fd, "lead"),
          story: str(fd, "story"),
          mission: str(fd, "mission"),
        },
        values,
        team,
        contact: { heading: str(fd, "contactHeading"), text: str(fd, "contactText") },
      } as never,
    });
  } catch (error) {
    return { error: explain(error) };
  }

  revalidatePath("/panel/biz-haqimizda");
  revalidatePath("/about");
  return { ok: true };
}
