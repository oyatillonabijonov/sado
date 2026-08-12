import type { GlobalConfig } from "payload";

/**
 * «Biz haqimizda» sahifasi — butunlay paneldan.
 *
 * Ilgari bu sahifadagi hamma narsa kodda edi: hikoya matni to'g'ridan-to'g'ri
 * JSX ichida, qadriyatlar va jamoa esa `data/team.ts` da. Mijoz jamoaga yangi
 * odam qo'sha olmasdi.
 *
 * Alohida global, kolleksiya emas: bu bitta sahifaning matni, mustaqil
 * yozuvlar to'plami emas. Jamoa a'zosi ham o'z sahifasiga ega bo'lmaydi —
 * u shu sahifadagi qator.
 *
 * **Hech bir maydon `required` emas.** Ikki sabab: (1) global bo'sh holda
 * yaratiladi va majburiy maydon birinchi saqlashni to'sib qo'yardi;
 * (2) `required` qoralamasiz jadvalda `NOT NULL` ustun chiqaradi va SQLite
 * uni `ALTER TABLE ADD COLUMN` bilan sukut qiymatisiz qabul qilmaydi —
 * `scripts/db-ensure.ts` dagi izohga qarang. Massiv qatorlari ichidagi
 * maydonlar bundan mustasno: ular yangi jadvalda tug'iladi, ustun
 * qo'shilmaydi.
 *
 * Sayt bo'sh maydonni ko'rsa `data/about.ts` va `data/team.ts` dagi
 * qiymatlarga qaytadi (`lib/about.ts`), ya'ni bu global qo'shilgan deploy
 * sahifani bo'shatmaydi.
 */
export const About: GlobalConfig = {
  slug: "about",
  label: "Biz haqimizda",
  access: { read: () => true },
  fields: [
    {
      type: "group",
      name: "intro",
      label: "Sahifa boshi",
      fields: [
        {
          name: "lead",
          type: "textarea",
          localized: true,
          label: "Sarlavha ostidagi qator",
          admin: { description: "Kulrang kichik matn — «Biz haqimizda» sarlavhasi ostida." },
        },
        {
          name: "story",
          type: "textarea",
          localized: true,
          label: "Birinchi xatboshi",
          admin: { description: "Kattaroq oq matn: agentlik qachon va kim tomonidan tashkil etilgan." },
        },
        {
          name: "mission",
          type: "textarea",
          localized: true,
          label: "Ikkinchi xatboshi",
          admin: { description: "Kulrang matn: nima uchun ishlaymiz." },
        },
      ],
    },
    {
      name: "values",
      type: "array",
      label: "Qanday ishlaymiz",
      admin: { description: "Har biri alohida karta bo'lib chiqadi. Tavsiya: to'rtta." },
      fields: [
        { name: "title", type: "text", localized: true, label: "Sarlavha" },
        { name: "text", type: "textarea", localized: true, label: "Matn" },
      ],
    },
    {
      name: "team",
      type: "array",
      label: "Jamoa",
      admin: {
        description:
          "Saytda 3:4 tik kadr bo'lib chiqadi. Surat qo'yilmasa odamning bosh harflari ko'rinadi — soxta stok surat qo'yishdan ko'ra shunisi yaxshi.",
      },
      fields: [
        { name: "name", type: "text", required: true, label: "Ism" },
        { name: "role", type: "text", localized: true, label: "Lavozimi" },
        { name: "photo", type: "upload", relationTo: "media", label: "Surati" },
      ],
    },
    {
      type: "group",
      name: "contact",
      label: "Aloqa bandi",
      fields: [
        { name: "heading", type: "text", localized: true, label: "Katta sarlavha" },
        { name: "text", type: "textarea", localized: true, label: "Sarlavha ostidagi matn" },
      ],
    },
  ],
};
