"use server";

import { revalidatePath } from "next/cache";
import { payloadClient, requireUser } from "@/panel/auth";
import { readRows } from "@/panel/rows";
import { explain, type FormState } from "@/panel/form-state";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function saveAbout(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser();

  const values = readRows(fd, "values", ["title", "text"]);
  // Surat ixtiyoriy: suratsiz a'zo saytda bosh harflari bilan chiqadi.
  const team = readRows(fd, "team", ["name", "role", "photo"], ["photo"]).map((m) => ({
    name: m.name,
    role: m.role,
    photo: Number(m.photo) || null,
  }));

  try {
    const payload = await payloadClient();
    await payload.updateGlobal({
      slug: "about",
      data: {
        intro: {
          lead: str(fd, "lead"),
          story: str(fd, "story"),
          mission: str(fd, "mission"),
        },
        values,
        team,
        contact: { heading: str(fd, "contactHeading"), text: str(fd, "contactText") },
      } as never,
    });
  } catch (error) {
    return { error: explain(error) };
  }

  revalidatePath("/panel/biz-haqimizda");
  revalidatePath("/about");
  return { ok: true };
}
