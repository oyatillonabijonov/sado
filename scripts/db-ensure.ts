import { Database } from "bun:sqlite";
import { copyFileSync, existsSync } from "node:fs";

/**
 * Konteyner ishga tushishida bazani tayyorlaydi.
 *
 * `bun:sqlite` bilan — payload/tsx/lexical import qilmaydi, shuning uchun
 * konteynerdagi bun ostida ishonchli ishlaydi (db-init.ts esa yiqilardi).
 *
 * 1. Volume bo'sh (baza yo'q) → image ichidagi sxema-only nusxani ko'chiradi.
 * 2. `schema.sqlite` da bor JADVAL bazada yo'q (yangi kolleksiya) → o'sha
 *    jadvalning CREATE'ini bajaradi.
 * 3. Mavjud jadvalda USTUN yetishmayapti (yangi maydon, yangi kolleksiya
 *    polimorf `_rels` jadvaliga ustun qo'shgani) → `ALTER TABLE ADD COLUMN`.
 *
 * Uchalasi ham qo'shuvchi amal: mavjud qatorlar joyida qoladi.
 *
 * **Nega 3-shox bor.** U yo'q edi va prodda quyidagi sodir bo'ldi:
 * `testimonials` bilan `submissions` kolleksiyalari qo'shilgan deploy'da
 * jadvallari yaratildi, lekin mavjud `payload_locked_documents_rels` ga
 * kerakli `testimonials_id` va `submissions_id` ustunlari qo'shilmadi.
 * Payload har bir `update` va `delete` da qulf jadvalini tozalaydi
 * (`checkDocumentLockStatus` → `db.deleteMany`, `overrideLock` dan qat'i
 * nazar), o'sha so'rov esa polimorf `_rels` ga JOIN qiladi va yetishmayotgan
 * ustunga murojaat qiladi → `SQLITE_ERROR: no such column`. Natijada mijoz
 * paneldan yozuv **qo'sha olardi** (`create` bu yo'ldan o'tmaydi), lekin
 * tahrirlay ham, o'chira ham olmasdi. Sxemaning jadval darajasidagi
 * tekshiruvi buni ko'rmaydi — ustun darajasi kerak.
 *
 * **Hamon aniqlanmaydigan narsa — ustun O'CHIRILISHI yoki NOM O'ZGARISHI.**
 * Ataylab: ikkalasi ham ma'lumot yo'qotadi, ya'ni ular qo'lda va ko'z bilan
 * qilinadigan ish. Bu skript hech qachon `DROP` bajarmaydi.
 */

const uri = process.env.DATABASE_URI || "file:/app/data/db.sqlite";
const LIVE = uri.replace(/^file:/, "");
const SCHEMA = process.env.SCHEMA_FILE || "/app/schema.sqlite";

type ColumnInfo = { name: string; type: string; notnull: number; dflt_value: string | null; pk: number };

const tableNames = (db: Database): Set<string> =>
  new Set(
    (db.query("select name from sqlite_master where type='table'").all() as { name: string }[]).map(
      (r) => r.name,
    ),
  );

const columnsOf = (db: Database, table: string): Map<string, ColumnInfo> =>
  new Map(
    (db.query(`pragma table_info("${table}")`).all() as ColumnInfo[]).map((c) => [c.name, c]),
  );

/** Jadvalga tegishli CREATE'lar — `type desc` bilan 'table' 'index'dan oldin keladi. */
const ddlFor = (db: Database, table: string): { type: string; name: string; sql: string }[] =>
  db
    .query(
      "select type, name, sql from sqlite_master where tbl_name = ? and sql is not null order by type desc",
    )
    .all(table) as { type: string; name: string; sql: string }[];

/**
 * Ustun `ALTER TABLE ADD COLUMN` bilan qo'shilishi mumkinmi?
 *
 * SQLite cheklovlari: PRIMARY KEY bo'lolmaydi, UNIQUE bo'lolmaydi, va NOT NULL
 * bo'lsa sukut qiymati bo'lishi shart. Payload/Drizzle chiqaradigan ustunlarning
 * deyarli hammasi nullable — mos kelmagani log'ga yoziladi va qo'lda hal
 * qilinadi (jimgina o'tkazib yuborilmaydi).
 */
const addable = (c: ColumnInfo): string | null => {
  if (c.pk) return "PRIMARY KEY";
  if (c.notnull && c.dflt_value === null) return "NOT NULL, sukut qiymatisiz";
  return null;
};

if (!existsSync(LIVE)) {
  copyFileSync(SCHEMA, LIVE);
  console.log(`[db-ensure] Bo'sh volume — sxema ko'chirildi: ${LIVE}`);
  process.exit(0);
}

const src = new Database(SCHEMA, { readonly: true });
const target = new Database(LIVE);

const liveTables = tableNames(target);
const schemaTables = tableNames(src);
const missingTables = [...schemaTables].filter((t) => !liveTables.has(t));

// Faqat ILGARIDAN bor jadvallarda ustun qidiriladi — endi yaratiladiganlari
// sxemadan to'liq ko'chiriladi.
const missingColumns = new Map<string, ColumnInfo[]>();
for (const table of [...schemaTables].filter((t) => liveTables.has(t))) {
  const have = columnsOf(target, table);
  const want = [...columnsOf(src, table).values()].filter((c) => !have.has(c.name));
  if (want.length) missingColumns.set(table, want);
}

if (!missingTables.length && !missingColumns.size) {
  target.close();
  src.close();
  process.exit(0);
}

// Bazaga tegishdan oldin nusxa. Jadval va ustun qo'shish qatorlarni
// o'chirmaydi, lekin bu mijozning yagona kontenti — yozuv o'rtasida uzilish
// ham qaytarib bo'ladigan bo'lib qolsin.
copyFileSync(LIVE, `${LIVE}.bak`);

/** Har bir CREATE alohida: bittasi yiqilsa qolganlari baribir qo'shiladi. */
const run = (label: string, sql: string) => {
  try {
    target.run(sql);
    return true;
  } catch (err) {
    // Yiqilib chiqib ketmaydi — entrypoint'da `set -e` bor va bu skript xato
    // bersa konteyner umuman ko'tarilmasdi, ya'ni bitta indeks butun saytni
    // o'chirardi.
    console.warn(`[db-ensure] Bajarilmadi (${label}): ${sql}\n  ${String(err)}`);
    return false;
  }
};

for (const table of missingTables) {
  for (const row of ddlFor(src, table)) run(row.name, row.sql);
}
if (missingTables.length) {
  console.log(`[db-ensure] Yangi jadval(lar): ${missingTables.join(", ")}`);
}

for (const [table, cols] of missingColumns) {
  const added: string[] = [];
  for (const c of cols) {
    const why = addable(c);
    if (why) {
      console.warn(
        `[db-ensure] QO'LDA KERAK: "${table}"."${c.name}" (${why}) — ALTER bilan qo'shib bo'lmaydi.`,
      );
      continue;
    }
    const parts = [`"${c.name}"`, c.type, c.dflt_value === null ? "" : `default ${c.dflt_value}`];
    // REFERENCES ataylab yo'q: SQLite tashqi kalitli ustunni faqat sukut
    // qiymati NULL bo'lganda qabul qiladi va Drizzle uni baribir talab
    // qilmaydi — cascade ota jadval orqali ishlaydi.
    if (run(`${table}.${c.name}`, `alter table "${table}" add column ${parts.join(" ").trim()}`)) {
      added.push(c.name);
    }
  }
  if (!added.length) continue;

  // Yangi ustunning indeksi ham sxemada bo'lishi mumkin. Nom bo'yicha
  // solishtiriladi: `create index if not exists` mavjudlariga tegmaydi.
  const liveIdx = new Set(
    (
      target
        .query("select name from sqlite_master where type='index' and tbl_name = ?")
        .all(table) as { name: string }[]
    ).map((r) => r.name),
  );
  for (const row of ddlFor(src, table)) {
    if (row.type === "index" && !liveIdx.has(row.name)) run(row.name, row.sql);
  }

  console.log(`[db-ensure] "${table}" ga yangi ustun(lar): ${added.join(", ")}`);
}

target.close();
src.close();
console.log(`[db-ensure] Tayyor (zaxira: ${LIVE}.bak)`);

process.exit(0);
