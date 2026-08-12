import { Database } from "bun:sqlite";
import { copyFileSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "bun:test";

/**
 * `db-ensure` prod bazasiga tegadigan yagona skript — u yangi jadval yoki
 * ustun qo'shishda mavjud qatorlarni yo'qotsa, buni faqat mijoz sezardi.
 *
 * Har bir sinov "oldingi versiya" bazasini yasaydi: sxemadan nusxa, undan
 * biror narsa olib tashlanadi va ichiga tegilmasligi kerak bo'lgan ma'lumot
 * qo'yiladi.
 */

const fixture = () => {
  const live = path.join(mkdtempSync(path.join(tmpdir(), "db-ensure-")), "db.sqlite");
  copyFileSync("schema.sqlite", live);
  return live;
};

const ensure = (live: string, schema = "schema.sqlite") =>
  Bun.$`bun scripts/db-ensure.ts`
    .env({ ...process.env, DATABASE_URI: `file:${live}`, SCHEMA_FILE: schema })
    .quiet();

const cols = (db: Database, table: string) =>
  new Set((db.query(`pragma table_info("${table}")`).all() as { name: string }[]).map((r) => r.name));

const indexes = (db: Database, table: string) =>
  new Set(
    (
      db
        .query("select name from sqlite_master where type='index' and tbl_name = ?")
        .all(table) as { name: string }[]
    ).map((r) => r.name),
  );

/**
 * Jadvalni ko'rsatilgan ustunlarsiz qayta yaratadi — "eski deploy" holatini
 * yasashning yagona yo'li. `alter table drop column` bu yerda yaramaydi:
 * ustun tashqi kalit ta'rifida qatnashsa SQLite uni o'chirishdan bosh tortadi
 * (prodda ham aynan shu jadval shunday edi).
 */
const rebuildWithout = (db: Database, table: string, drop: string[]) => {
  const { sql } = db
    .query("select sql from sqlite_master where type='table' and name = ?")
    .get(table) as { sql: string };
  const kept = sql
    .split("\n")
    .filter((line) => !drop.some((c) => line.includes(`\`${c}\``)))
    .join("\n")
    .replace(/,(\s*\))/, "$1");
  db.run(`drop table \`${table}\``);
  db.run(kept);
};

test("yangi jadvalni qo'shadi, mavjud ma'lumotga tegmaydi", async () => {
  const live = fixture();

  const before = new Database(live);
  before.run("drop table submissions");
  // Payload jadvallarining ustunlariga bog'lanmaslik uchun o'z jadvali:
  // sinov sxema o'zgarganda emas, mantiq buzilganda yiqilishi kerak.
  before.run("create table saqlanadi (x integer)");
  before.run("insert into saqlanadi values (42)");
  before.close();

  await ensure(live);

  const after = new Database(live, { readonly: true });
  const tables = after
    .query("select name from sqlite_master where type='table' and name='submissions'")
    .all();
  const kept = after.query("select x from saqlanadi").get() as { x: number } | null;
  after.close();

  expect(tables).toHaveLength(1);
  expect(kept?.x).toBe(42);
  // Tegishdan oldingi holat qaytariladigan bo'lib qolsin.
  expect(existsSync(`${live}.bak`)).toBe(true);
});

/**
 * Prodda 2026-08-12 da sodir bo'lgan holat: `testimonials` va `submissions`
 * qo'shilgan deploy'dan keyin `payload_locked_documents_rels` da ularning
 * ustunlari yo'q qoldi. Payload har `update`/`delete` da qulf jadvalini
 * tozalaydi va o'sha so'rov shu ustunlarga murojaat qiladi — natijada mijoz
 * yozuv qo'sha olardi, lekin tahrirlay ham, o'chira ham olmasdi.
 */
test("mavjud jadvalga yetishmayotgan ustunni va uning indeksini qo'shadi", async () => {
  const live = fixture();
  const TABLE = "payload_locked_documents_rels";

  const before = new Database(live);
  rebuildWithout(before, TABLE, ["testimonials_id", "submissions_id"]);
  expect(cols(before, TABLE).has("testimonials_id")).toBe(false);
  before.close();

  await ensure(live);

  const after = new Database(live, { readonly: true });
  const c = cols(after, TABLE);
  const idx = indexes(after, TABLE);
  after.close();

  expect(c.has("testimonials_id")).toBe(true);
  expect(c.has("submissions_id")).toBe(true);
  // Indekssiz ustun so'rovni ishlatadi-yu sekinlashtiradi.
  expect(idx.has(`${TABLE}_testimonials_id_idx`)).toBe(true);
  expect(idx.has(`${TABLE}_submissions_id_idx`)).toBe(true);
});

test("ustun qo'shganda mavjud qatorlar joyida qoladi", async () => {
  const live = fixture();

  const before = new Database(live);
  // `solution` — qoralamali kolleksiyada, ya'ni nullable: ALTER bilan
  // qo'shsa bo'ladi.
  rebuildWithout(before, "projects", ["solution"]);
  before.run(
    "insert into projects (id, title, slug, brief, updated_at, created_at) " +
      "values (1, 'KIIAS', 'kiias', 'qisqacha', '2026-01-01', '2026-01-01')",
  );
  before.close();

  await ensure(live);

  const after = new Database(live, { readonly: true });
  const row = after.query("select id, title, brief, solution from projects where id = 1").get() as
    | { id: number; title: string; brief: string; solution: string | null }
    | null;
  const has = cols(after, "projects").has("solution");
  after.close();

  expect(has).toBe(true);
  expect(row?.title).toBe("KIIAS");
  expect(row?.brief).toBe("qisqacha");
  expect(row?.solution).toBe(null);
});

/**
 * SQLite `NOT NULL` ustunni sukut qiymatisiz `ALTER` bilan qabul qilmaydi.
 * Payload buni qoralamasiz kolleksiyaning `required: true` maydonidan
 * chiqaradi (`services.fit_for`). Skript to'xtamasligi, qolganini bajarishi
 * va buni **baland ovozda** aytishi kerak — jimgina o'tkazib yuborilsa
 * xato yana prodda topilardi.
 *
 * Amaliy qoida: qoralamasiz kolleksiyaga yangi MAJBURIY maydon qo'shilsa,
 * unga `defaultValue` beriladi — o'shanda Drizzle `NOT NULL default …`
 * chiqaradi va ALTER o'tadi (`services.order` shunday).
 */
test("qo'shib bo'lmaydigan ustunni o'tkazib yuboradi va yiqilmaydi", async () => {
  const live = fixture();

  const before = new Database(live);
  rebuildWithout(before, "services", ["fit_for"]);
  before.run(
    "insert into services (id, title, slug, description, \"order\", updated_at, created_at) " +
      "values (1, 'Branding', 'branding', 'tavsif', 0, '2026-01-01', '2026-01-01')",
  );
  before.close();

  const out = await ensure(live);

  const after = new Database(live, { readonly: true });
  const has = cols(after, "services").has("fit_for");
  const row = after.query("select title from services where id = 1").get() as { title: string } | null;
  after.close();

  expect(has).toBe(false);
  expect(out.exitCode).toBe(0);
  expect(out.stdout.toString() + out.stderr.toString()).toContain("QO'LDA KERAK");
  // Eng muhimi: yiqilgan qadam mavjud qatorni olib ketmadi.
  expect(row?.title).toBe("Branding");
});

test("o'zgarish kerak bo'lmasa bazaga tegmaydi", async () => {
  const live = fixture();
  await ensure(live);
  // Zaxira faqat haqiqiy o'zgarishda olinadi — aks holda har konteyner ishga
  // tushganda oldingi zaxira ustiga yozilib ketardi.
  expect(existsSync(`${live}.bak`)).toBe(false);
});
