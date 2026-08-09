import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Build paytida sxemani bir marta bazaga push qiladi.
 *
 * `bunx payload generate:types` o'rniga shu skript: payload CLI `tsx` orqali
 * ishga tushadi va bun konteynerida "Cannot find module tsx://…" bilan yiqiladi.
 * Bu esa payload'ni bevosita bun bilan yuklaydi (tsx'siz), xuddi `next build`
 * kabi — shuning uchun konteynerda ishonchli ishlaydi.
 *
 * Nima uchun kerak: `next build` sahifalarni parallel ishchilar bilan quradi va
 * har biri getPayload'da sxemani push qilsa, bo'sh SQLite bir vaqtda yozishdan
 * qulflanadi. Shu yerda sxema oldindan yaratiladi, build esa push'siz (faqat
 * o'qib) ishlaydi (Dockerfile'da PAYLOAD_DISABLE_PUSH=1).
 */
await getPayload({ config });
console.log("Sxema tayyor.");
process.exit(0);
