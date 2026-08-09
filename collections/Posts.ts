import type { CollectionConfig } from "payload";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Maqola", plural: "Maqolalar" },
  admin: { useAsTitle: "title" },
  access: { read: () => true },
  // Avtosaqlash uchun: qoralama yozuvda majburiy maydonlar tekshirilmaydi,
  // shuning uchun yarim yozilgan matn ham saqlanadi. Sayt faqat chop
  // etilganini o'qiydi — Payload `find` sukut bo'yicha shunday ishlaydi.
  versions: { drafts: true },
  defaultSort: "-date",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "description", type: "textarea", required: true },
    { name: "date", type: "date", required: true },
    { name: "category", type: "text", required: true },
    { name: "author", type: "text", required: true },
    { name: "cover", type: "upload", relationTo: "media", required: true },
    // BlockEditor <-> Lexical: panel/lexical.ts ikki tomonga o'giradi,
    // sayt tomonida `toText` markdown qaytaradi va MDXRemote uni render qiladi.
    { name: "body", type: "richText" },
    // Maqolalar sana bo'yicha saralanadi, lekin ItemList strelkalari `order` ni kutadi.
    { name: "order", type: "number", required: true, defaultValue: 0 },
  ],
};
