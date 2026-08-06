import type { CollectionConfig } from "payload";

/* ponytail: maydonlar `localized: true` emas — saytda hozircha bitta til
 * chiqadi (components/Header.tsx dagi tanlagich faqat <html lang> ni almashtiradi).
 * Tarjima kerak bo'lganda maydonlarga `localized: true` qo'shiladi va formalar
 * LangTabs bilan o'raladi — panel toolkit'ida ikkalasi ham tayyor. */
export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Loyiha", plural: "Loyihalar" },
  admin: { useAsTitle: "title" },
  access: { read: () => true },
  defaultSort: "order",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "client", type: "text", required: true },
    { name: "year", type: "text", required: true },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "Branding",
      options: ["Branding", "Web", "UI/UX", "Print"],
    },
    { name: "services", type: "text", hasMany: true },
    { name: "cover", type: "upload", relationTo: "media", required: true },
    { name: "featured", type: "checkbox", defaultValue: false },
    { name: "brief", type: "textarea", required: true },
    { name: "solution", type: "textarea", required: true },
    {
      name: "results",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "value", type: "text", required: true },
      ],
    },
    { name: "gallery", type: "upload", relationTo: "media", hasMany: true },
    { name: "order", type: "number", required: true, defaultValue: 0 },
  ],
};
