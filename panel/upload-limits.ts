/**
 * Yuklashda nima qabul qilinadi — YAGONA manba.
 *
 * Ilgari ro'yxat uch joyda alohida yozilgan edi va ular bir-biriga mos
 * kelmasdi: `ImageDrop` (client) har qanday `image/*` ni o'tkazardi, server
 * esa atigi beshta turni bilardi. Natijada mos kelmagan fayl client
 * tekshiruvidan o'tib, serverda rad etilardi — foydalanuvchi esa nima uchun
 * ekanini bilmasdi, chunki xabar qabul qilingan turni aytmasdi.
 *
 * Direktivasiz va importsiz: client komponent ham, route handler ham, server
 * action ham shundan o'qiydi.
 */

/** 8 MB. Bundan kattasi avval rasm tahrirlagichga tushishi kerak. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/**
 * 20 MB — avtoijro etiladigan kadr uchun allaqachon katta. Chegara bor,
 * chunki fayl `/app/media` volume'ida yotadi va har bir tashrifchiga to'liq
 * uzatiladi: 100 MB'lik tanitim roligi mobil trafikni yeb qo'yardi.
 */
export const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

export const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  // Brauzerlar va telefonlar real hayotda shularni ham yuboradi. Ilgari
  // ro'yxatda yo'q edi va GIF yoki `image/jpg` (ba'zi Windows brauzerlari
  // shunday yozadi) client tekshiruvidan o'tib serverda yiqilardi.
  "image/gif",
  "image/jpg",
] as const;

/**
 * `video/quicktime` — `.mov`. `lib/site-format.ts` dagi `isVideo()` uni
 * ALLAQACHON video deb taniydi, ya'ni sayt uni to'g'ri chizadi; faqat yuklash
 * yo'lida ro'yxatdan tushib qolgan edi. Mac va iPhone'dan chiqqan kadr
 * ko'pincha aynan shu turda bo'ladi.
 */
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

export const isImageType = (t: string) => (IMAGE_TYPES as readonly string[]).includes(t);
export const isVideoType = (t: string) => (VIDEO_TYPES as readonly string[]).includes(t);
export const isAllowedType = (t: string) => isImageType(t) || isVideoType(t);

/**
 * Kengaytma → MIME. Serverda turni tiklash uchun kerak, pastdagi sababga qara.
 */
const BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

/**
 * Faylning haqiqiy turi.
 *
 * **Serverda `file.type` ga ishonib bo'lmaydi.** Bun'ning `formData()` client
 * yuborgan MIME turini tashlab yuboradi va uni fayl NOMIDAGI kengaytmadan
 * qayta hisoblaydi — ustiga katta-kichik harfni farqlab (o'lchangan,
 * bun 1.3.10):
 *
 *     kadr.mp4      → "video/mp4"
 *     kadr.MP4      → ""            ← rad etilardi
 *     IMG_4821.MOV  → ""            ← rad etilardi
 *     kadr          → ""            ← rad etilardi
 *
 * iPhone va kameralar videoni aynan `IMG_1234.MOV` deb saqlaydi, ya'ni bu
 * nazariy holat emas: mijoz 1 MB'lik videoni yuklay olmagani shundan edi.
 * Client tekshiruvidan o'tardi (brauzer to'g'ri MIME beradi), serverda esa
 * bo'sh tur ko'rinardi.
 *
 * Shuning uchun: tur tanilsa — o'shani ol, aks holda kengaytmadan tikla.
 * Natija Payload'ga ham shu ko'rinishda uzatiladi — aks holda media bazaga
 * bo'sh `mimeType` bilan yozilib, keyin noto'g'ri uzatilardi.
 */
export function resolveUploadType(file: { name: string; type: string }): string {
  if (isAllowedType(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return BY_EXTENSION[ext] ?? file.type;
}

export const limitFor = (t: string) => (isVideoType(t) ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES);

/**
 * Rad etish xabari qabul qilingan turni AYTADI.
 *
 * Ilgari u faqat ruxsat etilganlar ro'yxatini takrorlardi va mijoz "men mp4
 * yukladim-ku" deb qolardi — nima kelgani na unga, na bizga ko'rinardi.
 * Fayl nomi ham qo'shiladi: bir nechta fayl birdan tashlanganda qaysi biri
 * yiqilganini ajratish uchun.
 */
export function rejectMessage(file: { name: string; type: string }): string {
  const got = file.type ? `«${file.type}»` : "turi aniqlanmagan";
  return (
    `${file.name} — bu fayl turi qabul qilinmaydi (${got}). ` +
    `Rasm: JPG, PNG, WebP, AVIF, GIF, SVG. Video: MP4, WebM, MOV.`
  );
}
