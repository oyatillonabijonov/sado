/* Payload REST API. Panel Local API'dan foydalanadi — bu route faqat
 * yuklangan rasmlarni `/api/media/file/<nom>` orqali uzatish uchun kerak.
 * ponytail: GraphQL va Payload'ning o'z `/admin` UI route'lari generatsiya
 * qilinmadi — bizning surface `/panel`. Kerak bo'lsa Payload docs'dan qo'shing. */
import config from "@payload-config";
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";

export const GET = REST_GET(config);

/**
 * `HEAD` — chunki Payload uni bermaydi va Next ham bu route uchun o'zi
 * yasamaydi: prodda `GET /api/media/file/<nom>` 200, `HEAD` esa 404 qaytarardi.
 *
 * Ijtimoiy tarmoq skraperlari (Facebook, LinkedIn, Telegram) va bir qancha
 * crawlerlar rasmni yuklashdan oldin `HEAD` yuboradi — 404 olgach loyiha va
 * maqola muqovalari oldindan ko'rish oynasida chiqmay qolardi.
 *
 * Tanani `GET` dan olamiz va faqat sarlavhalarni qaytaramiz: fayl baribir
 * o'qiladi, lekin javob to'g'ri bo'ladi. Bu bandwidth optimizatsiyasi emas,
 * to'g'rilik masalasi.
 *
 * So'rov `GET` metodi bilan QAYTA quriladi — shundoq uzatilsa Payload'ning
 * o'z routeri metodga qarab yo'l qidiradi, `HEAD` uchun yo'l topmaydi va
 * o'zi 404 qaytaradi (o'lchangan: handler chaqirilardi, javob baribir 404).
 */
export const HEAD: typeof GET = async (req, ctx) => {
  const res = await GET(new Request(req.url, { method: "GET", headers: req.headers }), ctx);
  return new Response(null, { status: res.status, headers: res.headers });
};

export const POST = REST_POST(config);
export const DELETE = REST_DELETE(config);
export const PATCH = REST_PATCH(config);
export const PUT = REST_PUT(config);
export const OPTIONS = REST_OPTIONS(config);
