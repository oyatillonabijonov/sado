"use server";

import { revalidatePath } from "next/cache";
import { payloadClient, requireUser } from "@/panel/auth";
import { DEFAULT_LOCALE, type PanelLocale } from "@/panel/locale";
import { readRows, rowId } from "@/panel/rows";
import { explain, type FormState } from "@/panel/form-state";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function saveSettings(
  locale: PanelLocale,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireUser();
  const primary = locale === DEFAULT_LOCALE;

  // Qatorlar `RepeatRows` dan keladi; `readRows` ularni o'qiydi va
  // to'ldirilmaganini tashlaydi (`panel/form-map.ts`).
  // `id` — Payload qator identifikatori. Usiz massiv qaytadan yaratiladi
  // va **boshqa tildagi matn yo'qoladi** (o'lchangan).
  const socials = readRows(fd, "socials", ["label", "href"]).map((r) => ({
    id: rowId(r),
    label: r.label,
    href: r.href,
  }));
  const stats = readRows(fd, "stats", ["value", "label"]).map((r) => ({
    id: rowId(r),
    value: r.value,
    label: r.label,
  }));

  // Hero rasmlari — ImageStack `heroImages.0`, `heroImages.1`, … beradi.
  const stack = (prefix: string) =>
    [...fd.keys()]
      .filter((k) => k.startsWith(`${prefix}.`))
      .sort((a, b) => Number(a.split(".")[1]) - Number(b.split(".")[1]))
      .map((k) => Number(str(fd, k)))
      .filter((n) => Number.isFinite(n) && n > 0);

  const heroImages = stack("heroImages");
  const heroImagesMobile = stack("heroImagesMobile");

  try {
    const payload = await payloadClient();
    await payload.updateGlobal({
      slug: "settings",
      locale,
      data: {
        hero: { kicker: str(fd, "heroKicker"), heading: str(fd, "heroHeading") },
        // Rasmlar va havolalar lokalizatsiya qilinmagan — ular hujjatga
        // tegishli, tilga emas. Faqat asosiy tildan yoziladi, aks holda
        // ruscha ekran ularni ikkinchi marta yozib chiqardi.
        // `servicesCover` bu yerda yo'q — u `/panel/xizmatlar` ekranida,
        // `saveServicesCover` bilan saqlanadi.
        ...(primary ? { heroImages, heroImagesMobile } : {}),
        contact: { email: str(fd, "email"), phone: str(fd, "phone"), address: str(fd, "address") },
        stats,
        socials,
        description: str(fd, "description"),
      } as never,
    });
  } catch (error) {
    return { error: explain(error) };
  }

  revalidatePath("/panel/sozlamalar");
  // Sozlamalar butun saytda ishlatiladi — futer, bosh sahifa, meta.
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Faqat xizmatlar sahifasining muqovasi — `/panel/xizmatlar` ekranidan.
 *
 * Alohida action: `saveSettings` butun globalni yozadi va bu yerdan
 * chaqirilsa formada yo'q maydonlarni (hero matni, raqamlar, aloqa)
 * bo'shatib yuborardi.
 */
export async function saveServicesCover(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser();

  try {
    const payload = await payloadClient();
    await payload.updateGlobal({
      slug: "settings",
      data: { servicesCover: Number(str(fd, "servicesCover")) || null } as never,
    });
  } catch (error) {
    return { error: explain(error) };
  }

  revalidatePath("/panel/xizmatlar");
  revalidatePath("/", "layout");
  return { ok: true };
}
