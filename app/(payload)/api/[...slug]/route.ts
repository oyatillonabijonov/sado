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
export const POST = REST_POST(config);
export const DELETE = REST_DELETE(config);
export const PATCH = REST_PATCH(config);
export const PUT = REST_PUT(config);
export const OPTIONS = REST_OPTIONS(config);
