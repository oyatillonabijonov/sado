"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { payloadClient, requireUser } from "@/panel/auth";
import { explain, type FormState } from "@/panel/form-state";
import { DEFAULT_LOCALE, localeHref, type PanelLocale } from "@/panel/locale";

const LIST_PATH = "/panel/otzivlar";
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function saveTestimonial(
  id: number | null,
  locale: PanelLocale,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireUser();

  const primary = locale === DEFAULT_LOCALE;
  const quote = str(fd, "quote");
  const name = str(fd, "name");
  // Faqat asosiy tilda majburiy — ruscha bo'sh qolsa sayt o'zbekchasini beradi.
  if (primary && !quote) return { error: "Otziv matnini kiriting." };
  if (primary && !name) return { error: "Otziv kimniki ekanini yozing." };

  const data = {
    quote,
    name,
    role: str(fd, "role"),
    company: str(fd, "company"),
    order: Number(str(fd, "order") || 0),
  };

  const payload = await payloadClient();
  try {
    if (id === null) {
      const created = await payload.create({
        collection: "testimonials",
        locale,
        data: data as never,
      });
      revalidatePath(LIST_PATH);
      redirect(localeHref(`${LIST_PATH}/${created.id}`, locale));
    }
    await payload.update({ collection: "testimonials", id, locale, data: data as never });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { error: explain(error) };
  }

  revalidatePath(LIST_PATH);
  revalidatePath("/", "layout");
  return { ok: true };
}
