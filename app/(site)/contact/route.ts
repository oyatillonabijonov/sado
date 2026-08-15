import { permanentRedirect } from "next/navigation";
import { localePath } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";

/**
 * `/contact` sahifasi olib tashlandi — mazmuni `/about` ga ko'chdi.
 * Eski havolalar (vizitka, ijtimoiy tarmoqlardagi bio, indekslangan sahifa)
 * 404 bermasligi uchun yo'naltirish.
 *
 * `permanentRedirect`, oddiy `redirect` emas: u 307 (vaqtinchalik) qaytaradi
 * va vaqtinchalik ko'chirish havola og'irligini yangi manzilga o'tkazmaydi —
 * `/contact` indeksda o'z holicha qolib ketaverardi. Sahifa qaytib kelmaydi,
 * ya'ni ko'chirish chindan doimiy.
 *
 * Til saqlanadi: `/ru/contact` dan kelgan odam ruscha sahifaga tushishi
 * kerak. Ilgari ikkalasi ham o'zbekchaga ketardi.
 */
export async function GET() {
  permanentRedirect(localePath(await currentLocale(), "/about") + "#aloqa");
}
