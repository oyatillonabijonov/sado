import "server-only";
import { findRaw, nextOrder, relId, relIds } from "@/panel/doc";
import { toLines } from "@/panel/lines";
import { SLOTS } from "@/panel/slots";

export type ProjectFormData = {
  id: number | null;
  title: string;
  slug: string;
  client: string;
  year: string;
  category: string;
  services: string;
  cover: number | null;
  featured: boolean;
  brief: string;
  solution: string;
  results: { label: string; value: string }[];
  gallery: number[];
  order: number;
};

const padResults = (rows: { label: string; value: string }[]) =>
  Array.from({ length: SLOTS.metrics }, (_, i) => rows[i] ?? { label: "", value: "" });

export async function emptyProject(): Promise<ProjectFormData> {
  return {
    id: null,
    title: "",
    slug: "",
    client: "",
    year: String(new Date().getFullYear()),
    category: "Branding",
    services: "",
    cover: null,
    featured: false,
    brief: "",
    solution: "",
    results: padResults([]),
    gallery: [],
    order: await nextOrder("projects"),
  };
}

export async function loadProject(id: number): Promise<ProjectFormData | null> {
  const doc = await findRaw("projects", id);
  if (!doc) return null;

  const results = Array.isArray(doc.results)
    ? (doc.results as { label?: string; value?: string }[]).map((r) => ({
        label: String(r.label ?? ""),
        value: String(r.value ?? ""),
      }))
    : [];

  return {
    id: doc.id as number,
    title: String(doc.title ?? ""),
    slug: String(doc.slug ?? ""),
    client: String(doc.client ?? ""),
    year: String(doc.year ?? ""),
    category: String(doc.category ?? "Branding"),
    services: toLines(doc.services),
    cover: relId(doc.cover),
    featured: Boolean(doc.featured),
    brief: String(doc.brief ?? ""),
    solution: String(doc.solution ?? ""),
    results: padResults(results),
    gallery: relIds(doc.gallery),
    order: Number(doc.order ?? 0),
  };
}
