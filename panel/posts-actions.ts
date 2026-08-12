"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_LOCALE, localeHref, type PanelLocale } from "@/panel/locale";
import { redirect } from "next/navigation";
import { payloadClient, requireUser } from "@/panel/auth";
import { postDataFrom } from "@/panel/form-map";
import { explain, type FormState } from "@/panel/form-state";

const LIST_PATH = "/panel/maqolalar";

/** Saqlash tugmasi — chop etish. Avtosaqlash esa qoralama yozadi. */
export async function savePost(
  id: number | null,
  locale: PanelLocale,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireUser();

  const primary = locale === DEFAULT_LOCALE;
  const data = { ...postDataFrom(fd, primary), _status: "published" };
  // Faqat asosiy tilda majburiy — ruscha bo'sh qolsa sayt o'zbekchasini beradi.
  if (primary && !data.title) return { error: "Sarlavhani kiriting." };
  if (primary && !data.cover) return { error: "Maqola rasmini tanlang." };

  const payload = await payloadClient();
  try {
    if (id === null) {
      const created = await payload.create({ collection: "posts", locale, data: data as never });
      revalidatePath(LIST_PATH);
      redirect(localeHref(`${LIST_PATH}/${created.id}`, locale));
    }
    await payload.update({ collection: "posts", id, locale, data: data as never });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { error: explain(error) };
  }

  revalidatePath(LIST_PATH);
  revalidatePath("/", "layout");
  return { ok: true };
}
