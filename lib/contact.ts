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
});

export type ContactInput = z.infer<typeof contactSchema>;
