"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { payloadClient, requireUser } from "@/panel/auth";
import { projectDataFrom } from "@/panel/form-map";
import { explain, type FormState } from "@/panel/form-state";

const LIST_PATH = "/panel/loyihalar";

/** Saqlash tugmasi — chop etish. Avtosaqlash esa qoralama yozadi. */
export async function saveProject(
  id: number | null,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireUser();

  const data = { ...projectDataFrom(fd), _status: "published" };
  if (!data.title) return { error: "Loyiha nomini kiriting." };

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
