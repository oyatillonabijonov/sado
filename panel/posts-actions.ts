"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { payloadClient, requireUser } from "@/panel/auth";
import { postDataFrom } from "@/panel/form-map";
import { explain, type FormState } from "@/panel/form-state";

const LIST_PATH = "/panel/maqolalar";

/** Saqlash tugmasi — chop etish. Avtosaqlash esa qoralama yozadi. */
export async function savePost(
  id: number | null,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireUser();

  const data = { ...postDataFrom(fd), _status: "published" };
  if (!data.title) return { error: "Sarlavhani kiriting." };
  if (!data.cover) return { error: "Maqola rasmini tanlang." };

  const payload = await payloadClient();
  try {
    if (id === null) {
      const created = await payload.create({ collection: "posts", data: data as never });
      revalidatePath(LIST_PATH);
      redirect(`${LIST_PATH}/${created.id}`);
    }
    await payload.update({ collection: "posts", id, data: data as never });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { error: explain(error) };
  }

  revalidatePath(LIST_PATH);
  revalidatePath("/", "layout");
  return { ok: true };
}
