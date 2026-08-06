"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { payloadClient, requireUser } from "@/panel/auth";
import { slugify } from "@/panel/format";
import { explain, type FormState } from "@/panel/form-state";
import { fromBlocks, parseBlocks } from "@/panel/lexical";

const LIST_PATH = "/panel/maqolalar";
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function savePost(
  id: number | null,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireUser();

  const title = str(fd, "title");
  if (!title) return { error: "Sarlavhani kiriting." };

  const cover = str(fd, "cover");
  if (!cover) return { error: "Maqola rasmini tanlang." };

  const data = {
    title,
    slug: slugify(str(fd, "slug") || title),
    description: str(fd, "description"),
    date: str(fd, "date") || new Date().toISOString().slice(0, 10),
    category: str(fd, "category"),
    author: str(fd, "author"),
    cover: Number(cover),
    // parseBlocks brauzerdan kelgan JSON'ni ishonmasdan tekshiradi.
    body: fromBlocks(parseBlocks(fd.get("body"))),
    order: Number(str(fd, "order") || 0),
  };

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
