import { redirect } from "next/navigation";

/**
 * `/contact` sahifasi olib tashlandi — mazmuni `/about` ga ko'chdi.
 * Eski havolalar (vizitka, ijtimoiy tarmoqlardagi bio, indekslangan sahifa)
 * 404 bermasligi uchun yo'naltirish.
 */
export function GET() {
  redirect("/about#aloqa");
}
