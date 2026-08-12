import { Database } from "bun:sqlite";
import { copyFileSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "bun:test";

/**
 * `migrate-locales` prod bazasidagi **mavjud** matnni ko'chiradi.
 *
 * Uning xatosi eng yomon turdan: matn bazada qoladi, lekin Payload uni yangi
 * joydan qidirib topmaydi va sayt loyihalarni nomsiz ko'rsatadi. Ma'lumot
 * yo'qolmaydi-yu, mijoz uchun yo'qolgan bilan barobar.
 *
 * Sinov "lokalizatsiyagacha bo'lgan" bazani yasaydi: sxemadan nusxa oladi,
 * `_locales` jadvallarini tashlab yuboradi va matnni eski ustunlarga
 * qaytaradi — deploy paytida baza aynan shu holatda bo'ladi.
 */

const run = (live: string) =>
  Bun.$`bun scripts/migrate-locales.ts`
    .env({ ...process.env, DATABASE_URI: `file:${live}`, SCHEMA_FILE: "schema.sqlite" })
    .quiet()
    .nothrow();

const cols = (db: Database, table: string) =>
  new Set((db.query(`pragma table_info("${table}")`).all() as { name: string }[]).map((r) => r.name));

/**
 * Lokalizatsiyagacha bo'lgan `services`: `_locales` jadvali bo'sh, matn esa
 * asosiy jadvalning eski ustunlarida.
 */
function preI18n() {
  const live = path.join(mkdtempSync(path.join(tmpdir(), "locales-")), "db.sqlite");
  copyFileSync("schema.sqlite", live);
  const db = new Database(live);

  // `services` ni lokalizatsiyagacha bo'lgan shaklda qayta yaratamiz: matn
  // asosiy jadvalda va ustunlar `NOT NULL`, sukut qiymatisiz — aynan shu
  // Payload'ning upsert'ini yiqitadi. `ALTER ADD COLUMN` bilan bunday ustun
  // qo'shib bo'lmaydi, shuning uchun jadval qaytadan quriladi.
  db.run("drop table services");
  db.run(`create table services (
    id integer primary key not null,
    title text not null,
    slug text not null,
    description text not null,
    fit_for text not null,
    "order" numeric not null default 0,
    updated_at text not null default '',
    created_at text not null default ''
  )`);
  db.run(
    "insert into services (id, slug, title, description, fit_for, \"order\", updated_at, created_at) " +
      "values (1, 'brending', 'Branding', 'Tavsif', 'Kimga', 0, '2026-01-01', '2026-01-01')",
  );
  db.run(
    "insert into services_texts (id, \"order\", parent_id, path, text) " +
      "values (1, 0, 1, 'deliverables', 'Birinchi band')",
  );
  db.close();
  return live;
}

test("matnni _locales jadvaliga ko'chiradi", async () => {
  const live = preI18n();
  const out = await run(live);
  expect(out.exitCode).toBe(0);

  const db = new Database(live, { readonly: true });
  const row = db
    .query("select _locale, title, description, fit_for from services_locales where _parent_id = 1")
    .get() as { _locale: string; title: string; description: string; fit_for: string } | null;
  const text = db.query("select locale from services_texts where parent_id = 1").get() as
    | { locale: string }
    | null;
  const kept = db.query("select slug from services where id = 1").get() as { slug: string } | null;
  db.close();

  expect(row?._locale).toBe("uz");
  expect(row?.title).toBe("Branding");
  expect(row?.description).toBe("Tavsif");
  expect(row?.fit_for).toBe("Kimga");
  // `hasMany` matn alohida jadvalga emas, `locale` ustuniga tayanadi.
  expect(text?.locale).toBe("uz");
  // Lokalizatsiya qilinmagan maydon joyida.
  expect(kept?.slug).toBe("brending");
});

/**
 * Payload `update` ni upsert bilan bajaradi va yetim qolgan `NOT NULL`
 * ustunni to'ldirmaydi — natijada **har qanday saqlash yiqiladi**. Shuning
 * uchun migratsiya faqat shundaylarini, faqat nusxa ko'chirilgach oladi.
 */
test("yozuvni bloklaydigan yetim ustunni olib tashlaydi", async () => {
  const live = preI18n();
  await run(live);

  const db = new Database(live, { readonly: true });
  const c = cols(db, "services");
  db.close();

  expect(c.has("title")).toBe(false);
  expect(c.has("description")).toBe(false);
  expect(c.has("fit_for")).toBe(false);
});

test("nullable yetim ustunga tegmaydi — orqaga qaytish yo'li ochiq qoladi", async () => {
  const live = preI18n();
  const before = new Database(live);
  // Qoralamali kolleksiyaning ustuni nullable — yozuvni bloklamaydi, ya'ni
  // migratsiya uni **o'chirmasligi** kerak.
  before.run("alter table projects add column title text");
  before.run(
    "insert into projects (id, slug, title, updated_at, created_at) " +
      "values (1, 'kiias', 'KIIAS', '2026-01-01', '2026-01-01')",
  );
  before.close();

  await run(live);

  const db = new Database(live, { readonly: true });
  const has = cols(db, "projects").has("title");
  const old = db.query("select title from projects where id = 1").get() as { title: string } | null;
  const moved = db
    .query("select title from projects_locales where _parent_id = 1 and _locale = 'uz'")
    .get() as { title: string } | null;
  db.close();

  expect(has).toBe(true);
  expect(old?.title).toBe("KIIAS");
  expect(moved?.title).toBe("KIIAS");
});

test("ikkinchi marta ishga tushirilganda hech narsa qilmaydi", async () => {
  const live = preI18n();
  await run(live);

  const db = new Database(live, { readonly: true });
  const oldin = db.query("select count(*) c from services_locales").get() as { c: number };
  db.close();

  const out = await run(live);

  const after = new Database(live, { readonly: true });
  const keyin = after.query("select count(*) c from services_locales").get() as { c: number };
  after.close();

  expect(out.exitCode).toBe(0);
  // Ikki barobar qator paydo bo'lmasin.
  expect(keyin.c).toBe(oldin.c);
});

test("zaxira oladi va kontentni yo'qotmaydi", async () => {
  const live = preI18n();
  await run(live);

  expect(existsSync(`${live}.pre-i18n`)).toBe(true);
  const backup = new Database(`${live}.pre-i18n`, { readonly: true });
  // Zaxirada eski holat: matn hamon asosiy jadvalda.
  const row = backup.query("select title from services where id = 1").get() as
    | { title: string }
    | null;
  backup.close();
  expect(row?.title).toBe("Branding");
});
