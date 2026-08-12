import { getPayload } from "payload";
import config from "@payload-config";
import type { Project, ProjectCategory } from "@/data/projects";
import type { Service } from "@/data/services";
import { testimonials as FALLBACK_TESTIMONIALS, type Testimonial } from "@/data/testimonials";
import { currentLocale } from "@/lib/locale";

/**
 * Saytning kontent o'quvchisi. Ilgari `data/*.ts` massivlari edi — endi Payload.
 * Komponentlar o'zgarmadi: shu yerda Payload hujjatlari eski `Project` va
 * `Service` shakliga o'giriladi.
 */

const client = async () => getPayload({ config });

/** Upload maydoni `depth` ga qarab id yoki hujjat qaytaradi. */
const url = (value: unknown): string =>
  value && typeof value === "object" && "url" in value ? String((value as { url: string }).url) : "";

const urls = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(url).filter(Boolean) : [];

function toProject(doc: Record<string, unknown>): Project {
  return {
    slug: String(doc.slug ?? ""),
    title: String(doc.title ?? ""),
    client: String(doc.client ?? ""),
    year: String(doc.year ?? ""),
    category: String(doc.category ?? "Branding") as ProjectCategory,
    services: Array.isArray(doc.services) ? doc.services.map(String) : [],
    cover: url(doc.cover),
    featured: Boolean(doc.featured),
    brief: String(doc.brief ?? ""),
    solution: String(doc.solution ?? ""),
    results: Array.isArray(doc.results)
      ? (doc.results as { label: string; value: string }[]).map((r) => ({
          label: String(r.label),
          value: String(r.value),
        }))
      : undefined,
    gallery: urls(doc.gallery),
  };
}

export async function getProjects(): Promise<Project[]> {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "projects",
    depth: 1,
    limit: 200,
    sort: "order",
    locale: await currentLocale(),
  });
  return docs.map((d) => toProject(d as unknown as Record<string, unknown>));
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "projects",
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
    locale: await currentLocale(),
  });
  return docs[0] ? toProject(docs[0] as unknown as Record<string, unknown>) : undefined;
}

/** Loyiha sahifasining pastidagi oldingi/keyingi — ro'yxat halqa bo'lib aylanadi. */
export async function adjacentProjects(slug: string) {
  const all = await getProjects();
  const i = all.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? all[i - 1] : all[all.length - 1],
    next: i < all.length - 1 ? all[i + 1] : all[0],
  };
}

/**
 * Otzivlar. Bo'sh bo'lsa `data/testimonials.ts` dagilar chiqadi.
 *
 * Loyihalar va maqolalardan farqli ravishda bu yerda zaxira bor: `db-ensure`
 * yangi jadvalni **bo'sh** yaratadi, ya'ni bu kolleksiya qo'shilgan deploy'dan
 * keyin prod bazasida bitta ham otziv bo'lmaydi. Zaxirasiz ishonch bandi
 * mijozning haqiqiy otzivlarini yo'qotgan holda chiqardi. Yon ta'siri: oxirgi
 * otzivni o'chirish kodagi uchtasini qaytaradi — mijoz hammasini o'chirmoqchi
 * bo'lsa, qatorni ko'rsatmaslikni bu yerda emas, sahifada hal qilish kerak.
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "testimonials",
    depth: 0,
    limit: 100,
    sort: "order",
    locale: await currentLocale(),
  });
  if (docs.length === 0) return FALLBACK_TESTIMONIALS;
  return docs.map((d) => ({
    quote: String(d.quote ?? ""),
    name: String(d.name ?? ""),
    role: String(d.role ?? ""),
    company: String(d.company ?? ""),
  }));
}

export async function getServices(): Promise<Service[]> {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "services",
    depth: 0,
    limit: 100,
    sort: "order",
    locale: await currentLocale(),
  });
  return docs.map((d) => ({
    slug: String(d.slug ?? ""),
    title: String(d.title ?? ""),
    description: String(d.description ?? ""),
    deliverables: Array.isArray(d.deliverables) ? d.deliverables.map(String) : [],
    fitFor: String(d.fitFor ?? ""),
  }));
}
