import { z } from "zod";

export const serviceOptions = [
  "Brend strategiyasi",
  "Brend dizayn",
  "Veb-dizayn",
  "UI/UX dizayn",
  "Motion dizayn",
  "Print va editorial",
  "Boshqa",
] as const;

export const contactSchema = z.object({
  name: z.string().min(2, "Ismingizni kiriting"),
  phone: z.string().min(7, "Telefon raqamini kiriting"),
  company: z.string().optional(),
  service: z.enum(serviceOptions, { message: "Xizmat turini tanlang" }),
  // Ixtiyoriy va erkin matn — mijoz oraliq emas, bo'sh maydon tanladi.
  // Chegara bor, chunki bu tashqaridan keladigan yagona uzun matn.
  budget: z.string().trim().max(200, "Byudjetni qisqaroq yozing").optional(),
});

export type ServiceOption = (typeof serviceOptions)[number];

export type ContactInput = z.infer<typeof contactSchema>;
