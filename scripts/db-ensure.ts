import { Database } from "bun:sqlite";
import { copyFileSync, existsSync } from "node:fs";

/**
 * Konteyner ishga tushishida bazani tayyorlaydi.
 *
 * `bun:sqlite` bilan — payload/tsx/lexical import qilmaydi, shuning uchun
 * konteynerdagi bun ostida ishonchli ishlaydi (db-init.ts esa yiqilardi).
 *
 * 1. Volume bo'sh (baza yo'q) → image ichidagi sxema-only nusxani ko'chiradi.
 * 2. Baza bor, lekin schema.sqlite'da bo'lган jadval unда yo'q (yangi
 *    kolleksiya qo'shilgan) → o'sha jadval(lar)ning CREATE'ini sxemadan o'qib
 *    bajaradi. Mavjud jadvallarga tegmaydi, ya'ni kontent ham, foydalanuvchilar
 *    ham joyida qoladi.
 *
 * Ilgari bu shox butun faylni almashtirardi va shuning uchun faqat baza bo'sh
 * (0 foydalanuvchi) bo'lganda ishlardi — birinchi hisob ochilgan zahoti har
 * qanday yangi kolleksiya qo'lda migratsiya talab qilib qolardi. Jadvalni
 * qo'shish esa yo'qotadigan hech narsasi yo'q amal.
 *
 * Hamon aniqlamaydigan narsa — MAVJUD jadvaldagi ustun o'zgarishi (maydon
 * qo'shildi/nomi o'zgardi). Unisi qo'lda ALTER talab qiladi.
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
    const src = new Database(SCHEMA, { readonly: true });
    const target = new Database(LIVE);
    for (const table of missing) {
      // `order by type desc` — 'table' 'index'dan oldin keladi, ya'ni indeks
      // o'zi tegishli jadval yaratilgandan keyin quriladi.
      const rows = src
        .query("select sql from sqlite_master where tbl_name = ? and sql is not null order by type desc")
        .all(table) as { sql: string }[];
      for (const row of rows) target.run(row.sql);
    }
    target.close();
    src.close();
    console.log(`[db-ensure] Yangi jadval(lar) qo'shildi: ${missing.join(", ")}`);
  }
}

process.exit(0);
