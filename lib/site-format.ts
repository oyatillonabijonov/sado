/**
 * Client komponentlar uchun sayt ma'lumotlarining tipi va sof yordamchilari.
 *
 * Direktivasiz va Payload'ga tegmaydi — ataylab. `lib/settings.ts` dan
 * **qiymat** import qilgan client komponent butun Payload grafini (sharp,
 * nodemailer, SQLite drayveri) brauzer bundle'iga tortadi va build
 * `child_process` topilmadi deb yiqiladi. Tip import'i erishi mumkin, qiymat
 * — yo'q, shuning uchun ular shu yerda turadi.
 */

export type SiteSettings = {
  heroKicker: string;
  heroHeading: string;
  heroImages: string[];
  /** Telefon uchun tik kadrlar. Bo'sh bo'lsa `heroImages` ishlatiladi. */
  heroImagesMobile: string[];
  /** Xizmatlar sahifasining boshidagi keng kadr. */
  servicesCover: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  /** Ishonch bandidagi kartalar. `value` raqam bilan boshlansa sanab chiqiladi. */
  stats: { value: string; label: string }[];
  socials: { label: string; href: string }[];
};

/** `+998 90 123 45 67` → `tel:+998901234567` */
export const telHref = (phone: string) =>
  `tel:${phone.replace(/[^\d+]/g, "").replace(/^(?!\+)/, "+")}`;

/**
 * Galereya elementi video-mi?
 *
 * MIME turi emas, kengaytma bo'yicha — ataylab. Payload media URL'i har doim
 * asl fayl nomi bilan tugaydi (`/api/media/file/tanitim.mp4`), ya'ni kengaytma
 * bor. MIME'ni olib yurish uchun `Project.gallery` ni `string[]` dan
 * obyektlar massiviga aylantirish kerak bo'lardi — bu `data/projects.ts` dagi
 * sakkizta yozuvni, `lib/content.ts` ni, panel yuklovchisini va sayt
 * sahifasini bir vaqtda o'zgartirish degani, bitta regex bilan hal
 * bo'ladigan narsa uchun.
 */
export const isVideo = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url);
