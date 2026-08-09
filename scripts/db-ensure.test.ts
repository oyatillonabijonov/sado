import { Database } from "bun:sqlite";
import { copyFileSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "bun:test";

/**
 * `db-ensure` prod bazasiga tegadigan yagona skript — u yangi jadvalni
 * qo'shishda mavjud qatorlarni yo'qotsa, buni faqat mijoz sezardi.
 *
 * Sinov "oldingi versiya" bazasini yasaydi: sxemadan nusxa, undan `submissions`
 * olib tashlanadi va ichiga tegilmasligi kerak bo'lgan ma'lumot qo'yiladi.
 */
test("yangi jadvalni qo'shadi, mavjud ma'lumotga tegmaydi", async () => {
  const live = path.join(mkdtempSync(path.join(tmpdir(), "db-ensure-")), "db.sqlite");
  copyFileSync("schema.sqlite", live);

  const before = new Database(live);
  before.run("drop table submissions");
  // Payload jadvallarining ustunlariga bog'lanmaslik uchun o'z jadvali:
  // sinov sxema o'zgarganda emas, mantiq buzilganda yiqilishi kerak.
  before.run("create table saqlanadi (x integer)");
  before.run("insert into saqlanadi values (42)");
  before.close();

  await Bun.$`bun scripts/db-ensure.ts`
    .env({ ...process.env, DATABASE_URI: `file:${live}`, SCHEMA_FILE: "schema.sqlite" })
    .quiet();

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
