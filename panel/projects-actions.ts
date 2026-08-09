"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { payloadClient, requireUser } from "@/panel/auth";
import { slugify } from "@/panel/format";
import { explain, type FormState } from "@/panel/form-state";
import { fromLines } from "@/panel/lines";
import { SLOTS } from "@/panel/slots";

const LIST_PATH = "/panel/loyihalar";
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const rel = (fd: FormData, key: string) => (str(fd, key) ? Number(str(fd, key)) : null);

/** requireUser() har bir action'da — action o'z HTTP kirish nuqtasi, layout'ning qorovuli uni qamramaydi. */
export async function saveProject(
  id: number | null,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireUser();

  const title = str(fd, "title");
  if (!title) return { error: "Loyiha nomini kiriting." };

  const data = {
    title,
    slug: slugify(str(fd, "slug") || title),
    client: str(fd, "client"),
    year: str(fd, "year"),
    category: str(fd, "category"),
    services: fromLines(fd.get("services")),
    cover: rel(fd, "cover"),
    featured: fd.get("featured") === "on",
    brief: str(fd, "brief"),
    solution: str(fd, "solution"),
    // Bo'sh slotlar saqlashda tushib qoladi.
    results: Array.from({ length: SLOTS.metrics }, (_, i) => ({
      label: str(fd, `results.${i}.label`),
      value: str(fd, `results.${i}.value`),
    })).filter((r) => r.label && r.value),
    // Galereya endi qat'iy slot emas — nechta rasm bo'lsa shuncha kalit keladi.
    gallery: [...fd.keys()]
      .filter((k) => k.startsWith("gallery."))
      .sort((a, b) => Number(a.split(".")[1]) - Number(b.split(".")[1]))
      .map((k) => rel(fd, k))
      .filter((v): v is number => v !== null),
    order: Number(str(fd, "order") || 0),
  };

  const payload = await payloadClient();
  try {
    if (id === null) {
      const created = await payload.create({ collection: "projects", data: data as never });
      revalidatePath(LIST_PATH);
      redirect(`${LIST_PATH}/${created.id}`);
    }
    await payload.update({ collection: "projects", id, data: data as never });
  } catch (error) {
    // redirect() tashlash orqali signal beradi — ishlagan saqlashni xato deb ko'rsatmaslik uchun qayta tashlaymiz.
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { error: explain(error) };
  }

  revalidatePath(LIST_PATH);
  // Sayt o'qiganini keshlaydi; busiz tahrir saqlanadi-yu ko'rinmaydi.
  revalidatePath("/", "layout");
  return { ok: true };
}
