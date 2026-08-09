import type { GlobalConfig } from "payload";

/**
 * Sayt sozlamalari — bitta hujjat, kolleksiya emas.
 *
 * Bu yerga faqat **mijoz o'zgartiradigan matn** kiradi: aloqa ma'lumotlari,
 * ijtimoiy tarmoqlar, bosh sahifaning birinchi ekrani. Sayt nomi, manzili va
 * navigatsiya tuzilishi kodda qoladi — ular kontent emas, arxitektura, va
 * ularni paneldan o'zgartirish saytni buzishi mumkin.
 */
export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Sozlamalar",
  access: { read: () => true },
  fields: [
    {
      type: "group",
      name: "hero",
      label: "Bosh sahifa — birinchi ekran",
      fields: [
        {
          name: "kicker",
          type: "text",
          label: "Sarlavha ustidagi qator",
          admin: { description: "Masalan: Dizayn agentligi — Toshkent, 2018-yildan" },
        },
        {
          name: "heading",
          type: "textarea",
          label: "Katta sarlavha",
          admin: { description: "Yangi qatordan boshlansa, saytda ham yangi qatorga tushadi." },
        },
      ],
    },
    {
      name: "heroImages",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: "Bosh sahifa — orqa fon rasmlari",
      admin: {
        description: "Hero'da almashib turadigan rasmlar. Bo'sh qoldirilsa saytdagi standart rasmlar chiqadi.",
      },
    },
    {
      name: "heroImagesMobile",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: "Bosh sahifa — telefon uchun rasmlar",
      admin: {
        description:
          "Tik (vertikal) kadrlar — telefonda shular chiqadi. Bo'sh qoldirilsa yuqoridagi rasmlar ishlatiladi, lekin telefon ekrani tor bo'lgani uchun ularning chetlari qirqiladi. Tartibi yuqoridagi bilan bir xil bo'lsin.",
      },
    },
    {
      type: "group",
      name: "contact",
      label: "Aloqa",
      fields: [
        { name: "email", type: "text" },
        { name: "phone", type: "text" },
        { name: "address", type: "text", label: "Manzil" },
      ],
    },
    {
      /* Alohida kolleksiya bo'lishga arzimaydi: to'rtta qator, tartibi
         o'zgarmaydi va ular sayt matni — otziv kabi mustaqil yozuv emas. */
      name: "stats",
      type: "array",
      label: "Raqamlar",
      admin: { description: "Ishonch bandidagi kartalar. Masalan: 120+ / Yakunlangan loyihalar." },
      fields: [
        {
          name: "value",
          type: "text",
          required: true,
          label: "Raqam",
          admin: { description: "Raqam bilan boshlansa saytda sanab chiqiladi: 120+ → 0 dan 120 gacha." },
        },
        { name: "label", type: "text", required: true, label: "Yorliq" },
      ],
    },
    {
      name: "socials",
      type: "array",
      label: "Ijtimoiy tarmoqlar",
      fields: [
        { name: "label", type: "text", required: true, label: "Nomi" },
        { name: "href", type: "text", required: true, label: "Havola" },
      ],
    },
    {
      name: "description",
      type: "textarea",
      label: "Qidiruv tizimlari uchun tavsif",
      admin: { description: "Google natijalarida sayt ostida chiqadigan matn." },
    },
  ],
};
