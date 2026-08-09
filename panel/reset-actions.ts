"use server";

import { payloadClient } from "@/panel/auth";
import type { FormState } from "@/panel/form-state";

/**
 * Parolni tiklash — Payload'ning o'z mexanizmi ustida.
 *
 * `forgotPassword` token yaratadi va uni xat bilan yuboradi. SMTP sozlanmagan
 * bo'lsa Payload xatni server konsoliga yozadi: oqim baribir ishlaydi, faqat
 * havolani dasturchi loglardan olib beradi. Productionda `.env` ga to'rtta
 * SMTP qiymati qo'yiladi va mijoz o'zi tiklaydi.
 */

const MIN_PASSWORD = 10;

export async function requestReset(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Email kiriting." };

  const payload = await payloadClient();
  try {
    await payload.forgotPassword({ collection: "users", data: { email }, disableEmail: false });
  } catch {
    // Ataylab jim: xato matni "bu email ro'yxatda bor/yo'q" degan ma'lumotni
    // ochib beradi va hisob qidirishga yo'l qo'yadi.
  }
  return { ok: true };
}

export async function applyReset(_prev: FormState, fd: FormData): Promise<FormState> {
  const token = String(fd.get("token") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  const repeat = String(fd.get("repeat") ?? "");

  if (!token) return { error: "Havola to'liq emas. Xatdagi havolani to'liq oching." };
  if (password.length < MIN_PASSWORD) {
    return { error: `Parol kamida ${MIN_PASSWORD} ta belgidan iborat bo'lsin.` };
  }
  if (password !== repeat) return { error: "Ikkala parol bir xil emas." };

  const payload = await payloadClient();
  try {
    await payload.resetPassword({
      collection: "users",
      data: { token, password },
      overrideAccess: true,
    });
  } catch {
    return { error: "Havola eskirgan yoki noto'g'ri. Qaytadan so'rang." };
  }
  return { ok: true };
}
