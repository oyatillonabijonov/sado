import { Database } from "bun:sqlite";
import { copyFileSync, existsSync } from "node:fs";

/**
 * Konteyner ishga tushishida bazani tayyorlaydi.
 *
 * `bun:sqlite` bilan — payload/tsx/lexical import qilmaydi, shuning uchun
 * konteynerdagi bun ostida ishonchli ishlaydi (db-init.ts esa yiqilardi).
 *
 * 1. Volume bo'sh (baza yo'q) → image ichidagi sxema-only nusxani ko'chiradi.
 * 2. Baza bor, lekin schema.sqlite'da bo'lган jadval unда yo'q (sxema eskirgan):
 *    - foydalanuvchi 0 bo'lsa → bazani yangi sxema bilan almashtiradi (xavfsiz,
 *      kontent yo'q);
 *    - foydalanuvchi bor bo'lsa → tegmaydi, ogohlantiradi (qo'lda migratsiya
 *      kerak — kontent yo'qolmasin).
 *
 * Ustun-ichidagi o'zgarishlarni aniqlamaydi, faqat yangi jadvallarni — Payload
 * yangi kolleksiya/relation qo'shganda odatda yangi jadval paydo bo'ladi.
 */

const uri = process.env.DATABASE_URI || "file:/app/data/db.sqlite";
const LIVE = uri.replace(/^file:/, "");
const SCHEMA = process.env.SCHEMA_FILE || "/app/schema.sqlite";

const tableNames = (path: string): Set<string> => {
  const db = new Database(path, { readonly: true });
  const rows = db.query("select name from sqlite_master where type='table'").all() as {
    name: string;
  }[];
  db.close();
  return new Set(rows.map((r) => r.name));
};

if (!existsSync(LIVE)) {
  copyFileSync(SCHEMA, LIVE);
  console.log(`[db-ensure] Bo'sh volume — sxema ko'chirildi: ${LIVE}`);
} else {
  const live = tableNames(LIVE);
  const schema = tableNames(SCHEMA);
  const missing = [...schema].filter((t) => !live.has(t));

  if (missing.length) {
    let users = 0;
    if (live.has("users")) {
      const db = new Database(LIVE, { readonly: true });
      users = (db.query("select count(*) as c from users").get() as { c: number }).c;
      db.close();
    }
    if (users === 0) {
      copyFileSync(SCHEMA, LIVE);
      console.log(`[db-ensure] Bo'sh baza — sxema yangilandi (yangi: ${missing.join(", ")}).`);
    } else {
      console.warn(
        `[db-ensure] Sxema eskirgan, lekin ${users} foydalanuvchi bor — qo'lda migratsiya kerak. ` +
          `Yetishmayotgan jadvallar: ${missing.join(", ")}`,
      );
    }
  }
}

process.exit(0);
