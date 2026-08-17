import type { CollectionConfig } from "payload";
import { projectCategories } from "@/data/projects";

/* ponytail: maydonlar `localized: true` emas — saytda hozircha bitta til
 * chiqadi (components/Header.tsx dagi tanlagich faqat <html lang> ni almashtiradi).
 * Tarjima kerak bo'lganda maydonlarga `localized: true` qo'shiladi va formalar
 * LangTabs bilan o'raladi — panel toolkit'ida ikkalasi ham tayyor. */
export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Loyiha", plural: "Loyihalar" },
  admin: { useAsTitle: "title" },
  access: { read: () => true },
  // Avtosaqlash uchun: qoralama yozuvda majburiy maydonlar tekshirilmaydi,
  // shuning uchun yarim yozilgan matn ham saqlanadi. Sayt faqat chop
  // etilganini o'qiydi — Payload `find` sukut bo'yicha shunday ishlaydi.
  versions: { drafts: true },
  defaultSort: "order",
  fields: [
    { name: "title", type: "text", localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "client", type: "text", localized: true },
    { name: "year", type: "text", required: true },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "Branding",
      // Ro'yxat `data/projects.ts` da — panel va saytdagi filtr ham shundan
      // o'qiydi, ya'ni yangi tur bitta joyda qo'shiladi.
      options: [...projectCategories],
    },
    { name: "services", type: "text", hasMany: true, localized: true },
    { name: "cover", type: "upload", relationTo: "media", required: true },
    { name: "featured", type: "checkbox", defaultValue: false },
    { name: "brief", type: "textarea", localized: true },
    { name: "solution", type: "textarea", localized: true },
    {
      name: "results",
      type: "array",
      fields: [
        { name: "label", type: "text", localized: true },
        { name: "value", type: "text", localized: true },
      ],
    },
    { name: "gallery", type: "upload", relationTo: "media", hasMany: true },
    { name: "order", type: "number", required: true, defaultValue: 0 },
  ],
};
