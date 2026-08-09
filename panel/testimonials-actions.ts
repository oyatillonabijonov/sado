"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { payloadClient, requireUser } from "@/panel/auth";
import { explain, type FormState } from "@/panel/form-state";

const LIST_PATH = "/panel/otzivlar";
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function saveTestimonial(
  id: number | null,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireUser();

  const quote = str(fd, "quote");
  const name = str(fd, "name");
  if (!quote) return { error: "Otziv matnini kiriting." };
  if (!name) return { error: "Otziv kimniki ekanini yozing." };

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
      const created = await payload.create({ collection: "testimonials", data: data as never });
      revalidatePath(LIST_PATH);
      redirect(`${LIST_PATH}/${created.id}`);
    }
    await payload.update({ collection: "testimonials", id, data: data as never });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { error: explain(error) };
  }

  revalidatePath(LIST_PATH);
  revalidatePath("/", "layout");
  return { ok: true };
}
