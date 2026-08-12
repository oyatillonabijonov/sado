import { NextResponse } from "next/server";
import { currentUser, payloadClient } from "@/panel/auth";

/**
 * Panel uchun rasm yuklash — forma yubormasdan.
 *
 * Toolkit dastlab yuklashni alohida ekranga ajratgandi, sababi izohda shunday
 * yozilgan: "kontent formasi ichidagi file input yo nested form, yo tahrir
 * o'rtasida sahifa qayta yuklanishini keltiradi va yozilgan narsani yo'qotadi".
 * Bu to'g'ri, lekin u **forma yuborish** haqida. Fayl shu route'ga `fetch`
 * bilan ketsa forma umuman qimirlamaydi: nested form yo'q, reload yo'q,
 * yozilgan matn joyida qoladi.
 *
 * Shuning uchun bu server action emas, route handler: action'ni chaqirish
 * React formasiga bog'langan, `fetch` esa mustaqil.
 */

/** 8 MB. Bundan kattasi avval rasm tahrirlagichga tushishi kerak. */
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];

/**
 * Video — loyiha galereyasi uchun, gif o'rnida: sayt uni boshqaruvsiz,
 * ovozsiz va aylanma qilib chizadi.
 *
 * Payload sharp'ni faqat rasm MIME'lariga qo'llaydi, ya'ni `imageSizes` va
 * `resizeOptions` videoga tegmaydi — sxemaga ham, `Media` konfiguratsiyasiga
 * ham o'zgarish kerak emas (sinab ko'rilgan: mp4 to'g'ri saqlanadi, `sizes`
 * bo'sh qoladi).
 *
 * 20 MB — avtoijro etiladigan kadr uchun allaqachon katta. Chegara bor,
 * chunki fayl `/app/media` volume'ida yotadi va har bir tashrifchiga to'liq
 * uzatiladi: 100 MB'lik tanitim roligi mobil trafikni yeb qo'yardi.
 */
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const VIDEO = ["video/mp4", "video/webm"];

const limitFor = (type: string) =>
  VIDEO.includes(type) ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  // Har bir kirish nuqtasi o'zini qo'riqlaydi — layout'ning qorovuli
  // route handler'ni qamramaydi.
  if (!(await currentUser())) return bad("Avval tizimga kiring.", 401);

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return bad("Fayl kelmadi.");
  if (!IMAGE.includes(file.type) && !VIDEO.includes(file.type)) {
    return bad("Rasm (JPG, PNG, WebP, AVIF, SVG) yoki video (MP4, WebM) yuklang.");
  }
  const limit = limitFor(file.type);
  if (file.size > limit) {
    return bad(
      `Fayl juda katta (${Math.round(file.size / 1024 / 1024)} MB). ` +
        `${Math.round(limit / 1024 / 1024)} MB gacha bo'lsin.`,
    );
  }

  // Alt majburiy maydon, lekin uni yuklash paytida so'rash oqimni to'xtatadi.
  // Fayl nomidan boshlang'ich qiymat qo'yamiz va forma ichida tahrirlash
  // imkonini beramiz (pastdagi PATCH).
  const alt = String(form.get("alt") ?? "").trim() || file.name.replace(/\.[^.]+$/, "");

  const payload = await payloadClient();
  try {
    const doc = await payload.create({
      collection: "media",
      data: { alt },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    });
    return NextResponse.json({ id: doc.id, url: doc.url, label: doc.alt });
  } catch (error) {
    return bad(`Yuklab bo'lmadi: ${error instanceof Error ? error.message : String(error)}`, 500);
  }
}

/** Rasm ostidagi izohni (alt) forma ichida tahrirlash. */
export async function PATCH(request: Request) {
  if (!(await currentUser())) return bad("Avval tizimga kiring.", 401);

  const { id, alt } = (await request.json()) as { id?: number; alt?: string };
  if (!id) return bad("Rasm ko'rsatilmadi.");

  const text = String(alt ?? "").trim();
  if (!text) return bad("Izoh bo'sh bo'lmasin.");

  const payload = await payloadClient();
  await payload.update({ collection: "media", id, data: { alt: text } });
  return NextResponse.json({ ok: true });
}
