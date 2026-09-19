import type { CollectionConfig } from "payload";
import { serviceOptions } from "@/lib/contact";

/**
 * Aloqa formasidan kelgan so'rovlar — sayt yozadigan yagona kolleksiya.
 *
 * Barcha `access` yopiq, va bu ataylab: bu yerda odamlarning telefon raqamlari
 * turadi, Payload'ning REST API'si esa aks holda ularni `/api/submissions` da
 * hammaga ochib qo'yardi. Forma Local API orqali yozadi (u access'ni loyihaviy
 * ravishda chetlab o'tadi), panel esa `requireUser()` ortidagi
 * `payloadClient()` orqali o'qiydi. Ya'ni ichkaridan ishlaydi, tashqaridan yo'q.
 *
 * ponytail: "ko'rib chiqildi" belgisi yo'q — ro'yxat sana bo'yicha, eng yangisi
 * tepada. Kerak bo'lsa checkbox + panelda toggle. Ustun qo'shish endi qo'lda
 * migratsiya talab qilmaydi — `scripts/db-ensure.ts` nullable ustunni o'zi
 * qo'shadi (`budget` shunday qo'shilgan).
 */
export const Submissions: CollectionConfig = {
  slug: "submissions",
  labels: { singular: "So'rov", plural: "So'rovlar" },
  admin: { useAsTitle: "name", group: "Kontent" },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "phone", type: "text", required: true },
    { name: "company", type: "text" },
    { name: "service", type: "select", required: true, options: [...serviceOptions] },
    // Ixtiyoriy, erkin matn. Nullable ustun — `db-ensure` uni prodda
    // `ALTER TABLE ADD COLUMN` bilan o'zi qo'shadi, mavjud so'rovlar tegilmaydi.
    { name: "budget", type: "text" },
  ],
};
