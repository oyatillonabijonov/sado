"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_LOCALE, localeHref, type PanelLocale } from "@/panel/locale";
import { redirect } from "next/navigation";
import { payloadClient, requireUser } from "@/panel/auth";
import { slugify } from "@/panel/format";
import { explain, type FormState } from "@/panel/form-state";
import { fromLines } from "@/panel/lines";

const LIST_PATH = "/panel/xizmatlar";
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function saveService(
  id: number | null,
  locale: PanelLocale,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireUser();

  const title = str(fd, "title");
  // Faqat asosiy tilda majburiy: ruscha ekranda bo'sh qoldirilgan nom
  // saytda o'zbekchasini ko'rsatadi (`fallback: true`).
  if (!title && locale === DEFAULT_LOCALE) return { error: "Xizmat nomini kiriting." };

  const data = {
    title,
    // `slug` lokalizatsiya qilinmagan — ruscha ekrandan yozilsa manzil
    // o'zgarib, indekslangan URL buzilardi.
    ...(locale === DEFAULT_LOCALE ? { slug: slugify(str(fd, "slug") || title) } : {}),
    description: str(fd, "description"),
    deliverables: fromLines(fd.get("deliverables")),
    fitFor: str(fd, "fitFor"),
    order: Number(str(fd, "order") || 0),
  };

  const payload = await payloadClient();
  try {
    if (id === null) {
      const created = await payload.create({ collection: "services", locale, data: data as never });
      revalidatePath(LIST_PATH);
      redirect(localeHref(`${LIST_PATH}/${created.id}`, locale));
    }
    await payload.update({ collection: "services", id, locale, data: data as never });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { error: explain(error) };
  }

  revalidatePath(LIST_PATH);
  revalidatePath("/", "layout");
  return { ok: true };
}
