"use server";

import { revalidatePath } from "next/cache";
import { payloadClient, requireUser } from "@/panel/auth";
import { readRows } from "@/panel/rows";
import { explain, type FormState } from "@/panel/form-state";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function saveSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser();

  // Qatorlar `RepeatRows` dan keladi; `readRows` ularni o'qiydi va
  // to'ldirilmaganini tashlaydi (`panel/form-map.ts`).
  const socials = readRows(fd, "socials", ["label", "href"]) as unknown as {
    label: string;
    href: string;
  }[];
  const stats = readRows(fd, "stats", ["value", "label"]) as unknown as {
    value: string;
    label: string;
  }[];

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
