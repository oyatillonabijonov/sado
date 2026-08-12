import type { CollectionConfig } from "payload";

export const Services: CollectionConfig = {
  slug: "services",
  labels: { singular: "Xizmat", plural: "Xizmatlar" },
  admin: { useAsTitle: "title" },
  access: { read: () => true },
  defaultSort: "order",
  fields: [
    { name: "title", type: "text", localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "description", type: "textarea", localized: true },
    { name: "deliverables", type: "text", hasMany: true, localized: true },
    { name: "fitFor", type: "textarea", localized: true },
    { name: "order", type: "number", required: true, defaultValue: 0 },
  ],
};
