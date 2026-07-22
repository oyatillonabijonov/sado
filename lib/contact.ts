import { z } from "zod";

export const budgetOptions = [
  "$1,000 gacha",
  "$1,000 – $5,000",
  "$5,000 – $15,000",
  "$15,000+",
] as const;

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
  email: z.string().email("Email noto'g'ri formatda"),
  phone: z.string().min(7, "Telefon raqamini kiriting"),
  company: z.string().optional(),
  service: z.enum(serviceOptions, { message: "Xizmat turini tanlang" }),
  budget: z.enum(budgetOptions, { message: "Byudjet oralig'ini tanlang" }),
  message: z.string().min(10, "Loyihangiz haqida qisqacha yozing"),
});

export type ContactInput = z.infer<typeof contactSchema>;
