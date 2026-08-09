import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { contactSchema } from "@/lib/contact";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Noto'g'ri so'rov" },
      { status: 400 }
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  /* Local API — `submissions` da barcha access yopiq, tashqaridan yozib
     bo'lmaydi. Yozuv yiqilsa foydalanuvchiga xato qaytadi: "yuborildi" deb
     ko'rsatib so'rovni yo'qotish — mijoz kutgan qo'ng'iroqni yo'qotish. */
  try {
    const payload = await getPayload({ config });
    await payload.create({ collection: "submissions", data: parsed.data });
  } catch (err) {
    console.error("[SADO contact] saqlanmadi", err);
    return NextResponse.json(
      { ok: false, error: "Serverda xatolik. Iltimos, qayta urinib ko'ring." },
      { status: 500 }
    );
  }

  // TODO: xabarnoma (email/Telegram) — hozircha panelda ko'rinadi.
  return NextResponse.json({ ok: true });
}
