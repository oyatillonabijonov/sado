import { NextResponse, type NextRequest } from "next/server";

/**
 * `/ru/...` → `/...`, va so'rovga `x-locale: ru` sarlavhasi.
 *
 * Next 16 da bu fayl `middleware.ts` emas, `proxy.ts` deb ataladi.
 *
 * Nega rewrite, nega `app/(site)/[lang]/` emas: saytdagi URL'lar
 * (`/portfolio/kiias`, `/blog/naming`) allaqachon indekslangan va ular
 * o'zgarmasligi kerak. `[lang]` segmenti ularni `/uz/...` ga ko'chirardi.
 * Bu yerda o'zbekcha manzil o'z holicha qoladi, ruschasi esa prefiks oladi.
 *
 * Til sahifalarga sarlavha orqali yetadi (`lib/locale.ts`), cookie orqali
 * emas: cookie bilan bitta URL ikki xil sahifa qaytarardi va uni qidiruv
 * tizimi ham, kesh ham to'g'ri tushunmasdi.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isRu = pathname === "/ru" || pathname.startsWith("/ru/");

  const headers = new Headers(request.headers);
  headers.set("x-locale", isRu ? "ru" : "uz");
  // Sahifa o'z manzilini bilishi kerak — `hreflang` va til tugmasi shundan
  // quriladi. `next/headers` da so'rov URL'i yo'q.
  headers.set("x-pathname", pathname);

  if (!isRu) return NextResponse.next({ request: { headers } });

  const url = request.nextUrl.clone();
  url.pathname = pathname.slice(3) || "/";
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  /**
   * Panel, API, Next'ning o'z fayllari va statik fayllar chetlab o'tiladi:
   * `/panel` ning o'z tili bor (`?til=`), `/api` esa Payload'niki.
   */
  matcher: ["/((?!panel|api|_next/static|_next/image|favicon.ico|images|media|.*\\.\\w+$).*)"],
};
