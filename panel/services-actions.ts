"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { payloadClient, requireUser } from "@/panel/auth";
import { slugify } from "@/panel/format";
import { explain, type FormState } from "@/panel/form-state";
import { fromLines } from "@/panel/lines";

const LIST_PATH = "/panel/xizmatlar";
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function saveService(
  id: number | null,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireUser();

  const title = str(fd, "title");
  if (!title) return { error: "Xizmat nomini kiriting." };

  const data = {
    title,
    slug: slugify(str(fd, "slug") || title),
    description: str(fd, "description"),
    deliverables: fromLines(fd.get("deliverables")),
    fitFor: str(fd, "fitFor"),
    order: Number(str(fd, "order") || 0),
  };

  const payload = await payloadClient();
  try {
    if (id === null) {
      const created = await payload.create({ collection: "services", data: data as never });
      revalidatePath(LIST_PATH);
      redirect(`${LIST_PATH}/${created.id}`);
    }
    await payload.update({ collection: "services", id, data: data as never });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { error: explain(error) };
  }

  revalidatePath(LIST_PATH);
  revalidatePath("/", "layout");
  return { ok: true };
}
