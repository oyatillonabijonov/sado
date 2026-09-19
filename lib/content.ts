import { getPayload } from "payload";
import config from "@payload-config";
import { PROJECT_SORT, type Project, type ProjectCategory } from "@/data/projects";
import type { Service } from "@/data/services";
import type { Testimonial } from "@/data/testimonials";
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
    // Yangisi tepada — sababi `data/projects.ts` dagi PROJECT_SORT da.
    sort: PROJECT_SORT,
    locale: await currentLocale(),
  });
  return docs.map((d) => toProject(d as unknown as Record<string, unknown>));
}

/**
 * Bosh sahifadagi «So'nggi loyihalar» — belgilanganlarning birinchi `limit`
 * tasi, sayt tartibida (yangisi tepada, `PROJECT_SORT`).
 *
 * Ilgari `order` O'SISH tartibida olinib birinchi 4 tasi kesilardi: yangi
 * loyiha ro'yxat oxiriga tushgani uchun bosh sahifaga hech qachon chiqmasdi
 * (mijoz 6 tasini belgilagan, «Arbol» 6-bo'lib qolgan edi). Mijoz talabi:
 * 8 ta, yangisi birinchi (2026-09-19). `/portfolio` bilan bitta tartib —
 * panel strelkalari bilan qo'yilgani bosh sahifada ham saqlanadi.
 */
export async function getFeaturedProjects(limit: number): Promise<Project[]> {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "projects",
    depth: 1,
    limit,
    where: { featured: { equals: true } },
    sort: PROJECT_SORT,
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
 * Otzivlar. Bo'sh bo'lsa **bo'sh massiv** — sahifa bandni yashiradi.
 *
 * Ilgari bu yerda `data/testimonials.ts` dagi otzivlar zaxira bo'lib
 * turardi va mijoz haq edi: o'ylab topilgan odamning o'ylab topilgan
 * maqtovi saytda haqiqiy otziv bo'lib turardi, va uni paneldan
 * o'chirishning yo'li yo'q edi — bo'shatsang kodagilar qaytib kelardi.
 * `data/testimonials.ts` o'chirilmadi: u `scripts/seed.ts` uchun kerak.
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
