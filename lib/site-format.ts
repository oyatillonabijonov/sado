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
  email: string;
  phone: string;
  address: string;
  description: string;
  socials: { label: string; href: string }[];
};

/** `+998 90 123 45 67` → `tel:+998901234567` */
export const telHref = (phone: string) =>
  `tel:${phone.replace(/[^\d+]/g, "").replace(/^(?!\+)/, "+")}`;
