import "server-only";
import { findRaw, nextOrder, relId } from "@/panel/doc";
import { toBlocks, type Block } from "@/panel/lexical";

export type PostFormData = {
  id: number | null;
  title: string;
  slug: string;
  description: string;
  date: string;
  category: string;
  author: string;
  cover: number | null;
  blocks: Block[];
  /** Matn Lexical'dan blokka to'liq o'tmadi — saqlash tugmasi yashiriladi, yozuv yo'qolmasin. */
  lossy: boolean;
  order: number;
};

/** `<input type="date">` faqat `YYYY-MM-DD` ni tushunadi. */
const asDateInput = (value: unknown): string => {
  const d = value ? new Date(String(value)) : new Date();
  return (Number.isNaN(d.getTime()) ? new Date() : d).toISOString().slice(0, 10);
};

export async function emptyPost(): Promise<PostFormData> {
  return {
    id: null,
    title: "",
    slug: "",
    description: "",
    date: asDateInput(null),
    category: "",
    author: "",
    cover: null,
    blocks: [],
    lossy: false,
    order: await nextOrder("posts"),
  };
}

export async function loadPost(id: number): Promise<PostFormData | null> {
  const doc = await findRaw("posts", id);
  if (!doc) return null;

  const { blocks, lossy } = toBlocks(doc.body);

  return {
    id: doc.id as number,
    title: String(doc.title ?? ""),
    slug: String(doc.slug ?? ""),
    description: String(doc.description ?? ""),
    date: asDateInput(doc.date),
    category: String(doc.category ?? ""),
    author: String(doc.author ?? ""),
    cover: relId(doc.cover),
    blocks,
    lossy,
    order: Number(doc.order ?? 0),
  };
}
