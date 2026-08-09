"use server";

import { revalidatePath } from "next/cache";
import { payloadClient, requireUser } from "@/panel/auth";
import { explain, type FormState } from "@/panel/form-state";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function saveSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser();

  // Qatorlar soni oldindan ma'lum emas — formadagi kalitlardan o'qiladi.
  const socials = [...fd.keys()]
    .filter((k) => k.startsWith("socials.") && k.endsWith(".label"))
    .map((k) => k.split(".")[1])
    .sort((a, b) => Number(a) - Number(b))
    .map((i) => ({ label: str(fd, `socials.${i}.label`), href: str(fd, `socials.${i}.href`) }))
    .filter((s) => s.label && s.href);

  try {
    const payload = await payloadClient();
    await payload.updateGlobal({
      slug: "settings",
      data: {
        hero: { kicker: str(fd, "heroKicker"), heading: str(fd, "heroHeading") },
        contact: { email: str(fd, "email"), phone: str(fd, "phone"), address: str(fd, "address") },
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
