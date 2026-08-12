/**
 * Panelda qaysi tilda ishlayotganimiz.
 *
 * Yonma-yon tablar emas, URL: `/panel/xizmatlar/1?til=ru`. Sabab — mijoz
 * bir vaqtda bitta tilda yozadi, va ikkita to'plam maydonni bitta ekranga
 * sig'dirish formani ikki barobar uzaytiradi. URL'da bo'lgani uchun holat
 * sahifa yangilanganda ham, havola ulashilganda ham saqlanadi.
 *
 * Direktivasiz modul: buni ham server yuklovchilari, ham client formalari
 * import qiladi.
 */

export const PANEL_LOCALES = [
  { code: "uz", label: "O‘zbekcha", short: "UZ" },
  { code: "ru", label: "Ruscha", short: "RU" },
] as const;

export type PanelLocale = (typeof PANEL_LOCALES)[number]["code"];

/** Sayt shu tilda chiqadi va tarjimasi yo'q maydon shunga qaytadi. */
export const DEFAULT_LOCALE: PanelLocale = "uz";

export const isPanelLocale = (value: unknown): value is PanelLocale =>
  PANEL_LOCALES.some((l) => l.code === value);

/** `?til=` dan tilni o'qiydi; noma'lum qiymat asosiy tilga tushadi. */
export const localeFrom = (value: unknown): PanelLocale =>
  isPanelLocale(value) ? value : DEFAULT_LOCALE;

/** Joriy manzilga `?til=` qo'shadi (asosiy tilda parametr qo'yilmaydi). */
export const localeHref = (path: string, locale: PanelLocale) =>
  locale === DEFAULT_LOCALE ? path : `${path}?til=${locale}`;
