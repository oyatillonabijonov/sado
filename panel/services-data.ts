import "server-only";
import { DEFAULT_LOCALE, type PanelLocale } from "@/panel/locale";
import { findRaw, nextOrder } from "@/panel/doc";
import { toLines } from "@/panel/lines";

export type ServiceFormData = {
  id: number | null;
  title: string;
  slug: string;
  description: string;
  deliverables: string;
  fitFor: string;
  order: number;
};

export async function emptyService(): Promise<ServiceFormData> {
  return {
    id: null,
    title: "",
    slug: "",
    description: "",
    deliverables: "",
    fitFor: "",
    order: await nextOrder("services"),
  };
}

export async function loadService(
  id: number,
  locale: PanelLocale = DEFAULT_LOCALE,
): Promise<ServiceFormData | null> {
  const doc = await findRaw("services", id, locale);
  if (!doc) return null;
  return {
    id: doc.id as number,
    title: String(doc.title ?? ""),
    slug: String(doc.slug ?? ""),
    description: String(doc.description ?? ""),
    deliverables: toLines(doc.deliverables),
    fitFor: String(doc.fitFor ?? ""),
    order: Number(doc.order ?? 0),
  };
}
