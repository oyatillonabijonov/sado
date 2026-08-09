import "server-only";
import { findRaw, nextOrder } from "@/panel/doc";

export type TestimonialFormData = {
  id: number | null;
  quote: string;
  name: string;
  role: string;
  company: string;
  order: number;
};

export async function emptyTestimonial(): Promise<TestimonialFormData> {
  return {
    id: null,
    quote: "",
    name: "",
    role: "",
    company: "",
    order: await nextOrder("testimonials"),
  };
}

export async function loadTestimonial(id: number): Promise<TestimonialFormData | null> {
  const doc = await findRaw("testimonials", id);
  if (!doc) return null;
  return {
    id: doc.id as number,
    quote: String(doc.quote ?? ""),
    name: String(doc.name ?? ""),
    role: String(doc.role ?? ""),
    company: String(doc.company ?? ""),
    order: Number(doc.order ?? 0),
  };
}
