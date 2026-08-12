import type { CollectionConfig } from "payload";

/**
 * Mijoz otzivlari — bosh sahifadagi ishonch bandidagi qator.
 *
 * Mijoz logolari ataylab bu yerda emas: ular o'nlab turli nisbatda va tayyor
 * 224px WebP sifatida `public/` da turadi, `next/image` dan esa LCP sababli
 * chetlab o'tiladi (`components/ClientsMarquee.tsx`). Paneldan yuklanganda
 * o'sha optimizatsiya qoidasi qaytadan yozilishi kerak bo'lardi.
 */
export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  labels: { singular: "Otziv", plural: "Otzivlar" },
  admin: { useAsTitle: "name" },
  access: { read: () => true },
  defaultSort: "order",
  fields: [
    { localized: true, name: "quote", type: "textarea", label: "Otziv matni" },
    { name: "name", type: "text", required: true, label: "Ism" },
    { localized: true, name: "role", type: "text", label: "Lavozim" },
    { name: "company", type: "text", required: true, label: "Kompaniya" },
    { name: "order", type: "number", required: true, defaultValue: 0 },
  ],
};
