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
    { name: "quote", type: "textarea", required: true, label: "Otziv matni" },
    { name: "name", type: "text", required: true, label: "Ism" },
    { name: "role", type: "text", required: true, label: "Lavozim" },
    { name: "company", type: "text", required: true, label: "Kompaniya" },
    { name: "order", type: "number", required: true, defaultValue: 0 },
  ],
};
