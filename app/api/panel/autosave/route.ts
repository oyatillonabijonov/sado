import { NextResponse } from "next/server";
import { currentUser, payloadClient } from "@/panel/auth";
import { MAPPERS, isAutosavable } from "@/panel/form-map";

/**
 * Avtosaqlash — qoralama sifatida.
 *
 * `versions: { drafts: true }` yoqilgani uchun `draft: true` bilan yozganda
 * Payload majburiy maydonlarni tekshirmaydi. Busiz yarim yozilgan maqolani
 * saqlab bo'lmasdi: "Muallif kiritilmagan" xatosi har uch soniyada chiqib
 * turardi va avtosaqlashning ma'nosi qolmasdi.
 *
 * Sayt shu qoralamani ko'rmaydi — Payload `find` sukut bo'yicha faqat chop
 * etilgan versiyani qaytaradi. Chop etish esa "Saqlash" tugmasi orqali.
 *
 * Route handler, server action emas: bu forma yuborilishi emas, fon so'rovi.
 */
export async function POST(request: Request) {
  if (!(await currentUser())) {
    return NextResponse.json({ error: "Avval tizimga kiring." }, { status: 401 });
  }

  const fd = await request.formData();
  const collection = String(fd.get("__collection") ?? "");
  const id = Number(fd.get("__id"));

  if (!isAutosavable(collection)) {
    return NextResponse.json({ error: "Noma'lum kolleksiya." }, { status: 400 });
  }
  // Yangi, hali saqlanmagan yozuv uchun qoralama yaratilmaydi: har bir
  // tugmacha bosilishida yangi hujjat paydo bo'lib ketardi. Birinchi
  // "Saqlash" dan keyin avtosaqlash o'zi ishlay boshlaydi.
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ skipped: true });
  }

  const payload = await payloadClient();
  try {
    await payload.update({
      collection,
      id,
      draft: true,
      data: MAPPERS[collection](fd) as never,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
