import { Database } from "bun:sqlite";
import { copyFileSync, existsSync } from "node:fs";

/**
 * Mavjud kontentni lokalizatsiya jadvallariga ko'chiradi. Bir marta ishlaydi,
 * keyin har ishga tushishda jim o'tadi.
 *
 * **Nega kerak.** Maydonga `localized: true` qo'yilganda Payload uni asosiy
 * jadvaldan `<jadval>_locales` ga ko'chiradi. `db-ensure` yangi jadvalni
 * yaratadi, lekin **bo'sh** yaratadi va eski ustunlarni (ataylab) o'chirmaydi.
 * Ya'ni migratsiyasiz: matn bazada, eski ustunlarda turadi — Payload esa uni
 * yangi jadvaldan qidiradi va topmaydi. Sayt loyihalar, xizmatlar va
 * maqolalarni **nomsiz** ko'rsatardi. Ma'lumot yo'qolmaydi, lekin ko'rinmaydi,
 * va bu mijoz uchun bir xil narsa.
 *
 * **Ro'yxat qo'lda yozilmagan.** Nusxalanadigan jadval va ustunlar
 * `schema.sqlite` dan hisoblab olinadi: har bir `<X>_locales` uchun manba `X`,
 * ko'chiriladigan ustunlar esa `id`, `_locale`, `_parent_id` dan boshqa
 * hammasi. O'n uchta jadval va o'ttizdan ortiq ustunni qo'lda sanash — xatoga
 * eng yaqin yo'l, va uning xatosi jimgina kechadi.
 *
 * `hasMany` matn jadvallari (`services_texts` va shu kabilar) boshqacha:
 * ularda alohida jadval emas, `locale` ustuni paydo bo'ladi. Mavjud qatorlarda
 * u `NULL` bo'lib qoladi va Payload `locale = 'uz'` bo'yicha qidirib topmaydi —
 * shuning uchun ular ham to'ldiriladi.
 *
 * **Eski ustunlarning aksariyati joyida qoladi** — bir necha o'nlab kilobayt,
 * evaziga migratsiya noto'g'ri chiqsa qaytarish imkoniyati. Istisno pastda.
 *
 * ## Nega baribir bir nechta ustun o'chiriladi
 *
 * Payload `update` ni upsert bilan bajaradi:
 * `insert into services (id, slug, …) … on conflict (id) do update set …`.
 * Lokalizatsiyadan keyin u `title`, `description`, `fit_for` ni bilmaydi va
 * INSERT ro'yxatiga qo'shmaydi. Bazada esa ular hamon `NOT NULL`, sukut
 * qiymatisiz turadi — natijada `NOT NULL constraint failed: services.title`
 * va **har qanday saqlash yiqiladi**. Bu Faza 0 dagi qulf jadvali xatosining
 * aynan takrori bo'lardi, faqat kengroq.
 *
 * Shuning uchun migratsiya oxirida faqat quyidagi shartlarning **hammasiga**
 * javob beradigan ustun o'chiriladi:
 *   1. yangi sxemada yo'q (yetim),
 *   2. `NOT NULL` va sukut qiymati yo'q (ya'ni yozuvni bloklaydi),
 *   3. qiymati `<jadval>_locales` ga ko'chirilgani tasdiqlangan yoki jadval
 *      umuman bo'sh.
 * Nullable yetim ustunlar (28 tasi) tegilmaydi — ular hech narsani buzmaydi
 * va orqaga qaytish yo'lini ochiq qoldiradi.
 */

const uri = process.env.DATABASE_URI || "file:/app/data/db.sqlite";
const LIVE = uri.replace(/^file:/, "");
const SCHEMA = process.env.SCHEMA_FILE || "/app/schema.sqlite";
const LOCALE = process.env.DEFAULT_LOCALE || "uz";

if (!existsSync(LIVE)) {
  console.log("[locales] Baza yo'q — o'tkazildi.");
  process.exit(0);
}
if (!existsSync(SCHEMA)) {
  console.log("[locales] Sxema fayli yo'q — o'tkazildi.");
  process.exit(0);
}

const src = new Database(SCHEMA, { readonly: true });
const db = new Database(LIVE);

const tables = (d: Database): Set<string> =>
  new Set(
    (d.query("select name from sqlite_master where type='table'").all() as { name: string }[]).map(
      (r) => r.name,
    ),
  );

const columns = (d: Database, table: string): Set<string> =>
  new Set(
    (d.query(`pragma table_info("${table}")`).all() as { name: string }[]).map((r) => r.name),
  );

const count = (d: Database, table: string): number =>
  (d.query(`select count(*) c from "${table}"`).get() as { c: number }).c;

const liveTables = tables(db);
const schemaTables = tables(src);

/* ------------------------------------------------- 1. nima qilinishi kerak -- */

type Move = { base: string; target: string; cols: string[] };
const moves: Move[] = [];

for (const target of [...schemaTables].filter((t) => t.endsWith("_locales"))) {
  const base = target.slice(0, -"_locales".length);
  if (!liveTables.has(target) || !liveTables.has(base)) continue;
  // Faqat bazada hali ham turgan ustunlar — ya'ni ko'chirilishi kerak
  // bo'lganlari. Toza o'rnatishda ular yo'q va bu shox bo'sh qoladi.
  const wanted = [...columns(src, target)].filter((c) => !["id", "_locale", "_parent_id"].includes(c));
  const have = columns(db, base);
  const cols = wanted.filter((c) => have.has(c));
  if (cols.length) moves.push({ base, target, cols });
}

/** `locale` ustuni bor, lekin qatorlarida u to'ldirilmagan jadvallar. */
const texts = [...schemaTables].filter(
  (t) => liveTables.has(t) && columns(src, t).has("locale") && columns(db, t).has("locale"),
);

const pending = moves.filter((m) => count(db, m.target) === 0 && count(db, m.base) > 0);
const pendingTexts = texts.filter(
  (t) =>
    (db.query(`select count(*) c from "${t}" where locale is null`).get() as { c: number }).c > 0,
);

/**
 * Yozuvni bloklaydigan yetim ustunlar: yangi sxemada yo'q, `NOT NULL`, sukut
 * qiymatisiz. Payload'ning upsert'i ularni to'ldirmaydi va har saqlash
 * yiqiladi.
 */
type Blocker = { table: string; column: string };
const blockers: Blocker[] = [];
for (const t of [...schemaTables].filter((x) => liveTables.has(x))) {
  const want = columns(src, t);
  const rows = db.query(`pragma table_info("${t}")`).all() as {
    name: string;
    notnull: number;
    dflt_value: string | null;
  }[];
  for (const c of rows) {
    if (want.has(c.name)) continue;
    if (c.notnull && c.dflt_value === null) blockers.push({ table: t, column: c.name });
  }
}

if (!pending.length && !pendingTexts.length && !blockers.length) {
  db.close();
  src.close();
  process.exit(0);
}

/* ------------------------------------------------------------- 2. zaxira -- */

const BACKUP = `${LIVE}.pre-i18n`;
if (!existsSync(BACKUP)) {
  copyFileSync(LIVE, BACKUP);
  console.log(`[locales] Zaxira: ${BACKUP}`);
}

/* ------------------------------------------------------------ 3. ko'chirish -- */

const q = (s: string) => `"${s}"`;
let moved = 0;

db.run("begin");
try {
  for (const { base, target, cols } of pending) {
    const list = cols.map(q).join(", ");
    db.run(
      `insert into ${q(target)} (_locale, _parent_id, ${list})
       select ?, id, ${list} from ${q(base)}`,
      [LOCALE],
    );
    const n = count(db, target);
    moved += n;
    console.log(`[locales] ${base} → ${target}: ${n} qator (${cols.join(", ")})`);
  }

  for (const t of pendingTexts) {
    db.run(`update ${q(t)} set locale = ? where locale is null`, [LOCALE]);
    console.log(`[locales] ${t}: locale = '${LOCALE}' qo'yildi`);
  }

  /* --------------------------------------------------------- 4. tekshiruv -- */

  // Har bir ko'chirmada manba va nishon qatorlari soni teng bo'lishi shart.
  // Teng bo'lmasa hech narsa yozilmaydi — matn eski ustunlarda qoladi va
  // qayta urinish mumkin.
  const bad = pending.filter(({ base, target }) => count(db, target) !== count(db, base));
  if (bad.length) {
    throw new Error(
      `qatorlar soni mos kelmadi: ${bad.map((b) => `${b.base}→${b.target}`).join(", ")}`,
    );
  }

  /* --------------------------------- 5. bloklaydigan yetim ustunlarni olib tashlash -- */

  for (const { table, column } of blockers) {
    // Faqat ma'lumot xavfsiz joyda bo'lsa. Bo'sh jadvalda yo'qotadigan
    // narsa yo'q; to'lasida esa `<jadval>_locales` da har bir qatorga bitta
    // qator bo'lishi shart (yuqorida tekshirildi, lekin bu yerda ham
    // mustaqil qayta tekshiriladi — o'chirish qaytmaydigan amal).
    const rows = count(db, table);
    const target = `${table}_locales`;
    const safe = rows === 0 || (liveTables.has(target) && count(db, target) >= rows);
    if (!safe) {
      throw new Error(
        `${table}.${column} ni olib tashlab bo'lmadi: ${target} da ${liveTables.has(target) ? count(db, target) : "jadval yo'q"}, kerak ${rows}`,
      );
    }
    db.run(`alter table ${q(table)} drop column ${q(column)}`);
    console.log(`[locales] ${table}.${column} olib tashlandi (qiymati ${target} da)`);
  }

  db.run("commit");
} catch (err) {
  db.run("rollback");
  console.error(`[locales] TO'XTADI, o'zgarish qaytarildi: ${String(err)}`);
  console.error(`[locales] Kontent tegilmagan. Zaxira: ${BACKUP}`);
  db.close();
  src.close();
  process.exit(1);
}

console.log(`[locales] Tayyor — ${moved} qator '${LOCALE}' tiliga ko'chirildi.`);
db.close();
src.close();
process.exit(0);
