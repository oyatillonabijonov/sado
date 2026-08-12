import "server-only";
import { slugify } from "@/panel/format";
import { fromBlocks, parseBlocks } from "@/panel/lexical";
import { fromLines } from "@/panel/lines";
import { SLOTS } from "@/panel/slots";

/**
 * FormData → Payload hujjati.
 *
 * Bu o'girma ilgari server action'larning ichida yashardi. Endi avtosaqlash
 * route'i ham xuddi shu formani o'qiydi, shuning uchun u alohida modulga
 * chiqarildi: ikkita nusxa bo'lsa, biri ikkinchisidan sezdirmay ajralib
 * ketadi va qoralama chop etilgan yozuvdan boshqacha saqlanadi.
 *
 * `'use server'` moduli faqat async funksiya eksport qila oladi — shuning
 * uchun bular u yerda tura olmaydi.
 */

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const rel = (fd: FormData, key: string) => (str(fd, key) ? Number(str(fd, key)) : null);

/**
 * `primary` — asosiy tildagi ekranmi?
 *
 * `slug`, `cover`, `year`, `order` va galereya lokalizatsiya qilinmagan:
 * ular hujjatga tegishli, tilga emas. Ruscha ekrandan ularni yozish manzilni
 * o'zgartirib indekslangan URL'ni buzardi va rasmni ikkinchi marta
 * yozardi — shuning uchun ular faqat asosiy tildan keladi.
 */
export function projectDataFrom(fd: FormData, primary = true) {
  const title = str(fd, "title");
  return {
    title,
    ...(primary ? { slug: slugify(str(fd, "slug") || title) } : {}),
    client: str(fd, "client"),
    year: str(fd, "year"),
    category: str(fd, "category"),
    services: fromLines(fd.get("services")),
    cover: rel(fd, "cover"),
    featured: fd.get("featured") === "on",
    brief: str(fd, "brief"),
    solution: str(fd, "solution"),
    // Bo'sh slotlar saqlashda tushib qoladi. `id` — Payload qator
    // identifikatori: usiz ikkinchi tildagi raqamlar yo'qoladi (o'lchangan).
    results: Array.from({ length: SLOTS.metrics }, (_, i) => ({
      // Matnli id — `Number()` bilan o'girilsa tushib qolardi (rows.ts ga qarang).
      id: str(fd, `results.${i}.id`) || undefined,
      label: str(fd, `results.${i}.label`),
      value: str(fd, `results.${i}.value`),
    })).filter((r) => r.label && r.value),
    // Galereya qat'iy slot emas — nechta rasm bo'lsa shuncha kalit keladi.
    gallery: [...fd.keys()]
      .filter((k) => k.startsWith("gallery."))
      .sort((a, b) => Number(a.split(".")[1]) - Number(b.split(".")[1]))
      .map((k) => rel(fd, k))
      .filter((v): v is number => v !== null),
    order: Number(str(fd, "order") || 0),
  };
}

export function postDataFrom(fd: FormData, primary = true) {
  const title = str(fd, "title");
  return {
    title,
    ...(primary ? { slug: slugify(str(fd, "slug") || title) } : {}),
    description: str(fd, "description"),
    date: str(fd, "date") || new Date().toISOString().slice(0, 10),
    category: str(fd, "category"),
    author: str(fd, "author"),
    cover: rel(fd, "cover"),
    // parseBlocks brauzerdan kelgan JSON'ni ishonmasdan tekshiradi.
    body: fromBlocks(parseBlocks(fd.get("body"))),
    order: Number(str(fd, "order") || 0),
  };
}

export const MAPPERS = {
  projects: projectDataFrom,
  posts: postDataFrom,
} as const;

export type Autosavable = keyof typeof MAPPERS;
export const isAutosavable = (v: string): v is Autosavable => v in MAPPERS;
