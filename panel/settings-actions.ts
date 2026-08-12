"use server";

import { revalidatePath } from "next/cache";
import { payloadClient, requireUser } from "@/panel/auth";
import { explain, type FormState } from "@/panel/form-state";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function saveSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser();

  // Qatorlar soni oldindan ma'lum emas — formadagi kalitlardan o'qiladi.
  // `<prefix>.<i>.<field>` ko'rinishidagi kalitlar `.label` bo'yicha sanaladi,
  // keyin har bir indeks uchun ikkala maydon o'qiladi. Ikkalasi ham to'lgan
  // qatorlargina saqlanadi — bo'sh qator saytda bo'sh joy bo'lib chiqardi.
  const rows = <T extends Record<string, string>>(
    prefix: string,
    read: (i: string) => T,
  ): T[] =>
    [...fd.keys()]
      .filter((k) => k.startsWith(`${prefix}.`) && k.endsWith(".label"))
      .map((k) => k.split(".")[1])
      .sort((a, b) => Number(a) - Number(b))
      .map(read)
      .filter((row) => Object.values(row).every(Boolean));

  const socials = rows("socials", (i) => ({
    label: str(fd, `socials.${i}.label`),
    href: str(fd, `socials.${i}.href`),
  }));

  const stats = rows("stats", (i) => ({
    value: str(fd, `stats.${i}.value`),
    label: str(fd, `stats.${i}.label`),
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

  // Bitta upload: bo'sh bo'lsa `null` — sayt o'shanda standart kadrga qaytadi.
  const servicesCover = Number(str(fd, "servicesCover")) || null;

  try {
    const payload = await payloadClient();
    await payload.updateGlobal({
      slug: "settings",
      data: {
        hero: { kicker: str(fd, "heroKicker"), heading: str(fd, "heroHeading") },
        heroImages,
        heroImagesMobile,
        servicesCover,
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
