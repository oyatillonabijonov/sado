import { getPayload } from "payload";
import config from "@payload-config";
import { toText } from "@/panel/lexical";
import { currentLocale } from "@/lib/locale";

/**
 * Blog — MDX fayllari o'rniga Payload.
 *
 * Maqola matni Payload'da Lexical formatida yotadi; `toText` uni markdown'ga
 * qaytaradi va sahifa uni avvalgidek `MDXRemote` ga beradi. Panel tomonida
 * `BlockEditor` o'sha markdown bilan ishlaydi — `panel/lexical.test.ts` shu
 * ikki tomonlama o'girmani qo'riqlaydi.
 */

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  cover: string;
  author: string;
  readingTime: string;
}

function readingTimeOf(text: string) {
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 180))} daqiqa o'qish`;
}

const url = (value: unknown): string =>
  value && typeof value === "object" && "url" in value ? String((value as { url: string }).url) : "";

function toMeta(doc: Record<string, unknown>): PostMeta {
  return {
    slug: String(doc.slug ?? ""),
    title: String(doc.title ?? ""),
    description: String(doc.description ?? ""),
    date: String(doc.date ?? "").slice(0, 10),
    category: String(doc.category ?? ""),
    cover: url(doc.cover),
    author: String(doc.author ?? ""),
    readingTime: readingTimeOf(toText(doc.body).text),
  };
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "posts",
    depth: 1,
    limit: 200,
    sort: "-date",
    locale: await currentLocale(),
  });
  return (docs as unknown as Record<string, unknown>[]).map(toMeta);
}

export async function getPost(slug: string) {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "posts",
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
    locale: await currentLocale(),
  });
  const doc = docs[0] as unknown as Record<string, unknown> | undefined;
  if (!doc) return null;
  return { meta: toMeta(doc), content: toText(doc.body).text };
}

export async function getBlogCategories(): Promise<string[]> {
  return Array.from(new Set((await getAllPosts()).map((p) => p.category)));
}

export async function getRelatedPosts(slug: string, category: string, n = 2) {
  const all = (await getAllPosts()).filter((p) => p.slug !== slug);
  const same = all.filter((p) => p.category === category);
  return [...same, ...all.filter((p) => p.category !== category)].slice(0, n);
}
