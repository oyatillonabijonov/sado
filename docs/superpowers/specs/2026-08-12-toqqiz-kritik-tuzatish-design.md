# SADO — to'qqizta kritik kamchilikni tuzatish

Sana: 2026-08-12
Holat: loyihalash (tasdiqlanmagan)

Live sayt: `https://sado.agency` (Coolify, Oracle Ampere, konteyner
`iq5scwnoird4xmzefwfi2c0x`, commit `aaa83b0`). Bazada mijozning **haqiqiy**
kontenti bor: 7 xizmat, 5 loyiha, 1 maqola, 31 rasm. Hech biri yo'qolmasligi
kerak — bu butun rejaning birinchi cheklovi.

---

## 1. Aniqlangan sabablar

### #1 — Paneldan tahrirlab/o'chirib bo'lmaydi (KRITIK, sabab isbotlangan)

Prod bazasidagi `payload_locked_documents_rels` jadvalida **ikkita ustun
yetishmaydi**: `testimonials_id` va `submissions_id`.

Payload har bir `update` va `delete` da `checkDocumentLockStatus` ni chaqiradi,
u esa `overrideLock` qiymatidan **qat'i nazar** oxirida
`payload.db.deleteMany({ collection: 'payload-locked-documents', … })` bajaradi
(`node_modules/payload/dist/utilities/checkDocumentLockStatus.js:66-72`). SQLite
adapteri buni polimorf `rels` jadvaliga JOIN qilib yozadi va yetishmayotgan
ustunlarga murojaat qiladi → `SQLITE_ERROR: no such column: …testimonials_id`.

`create` bu yo'ldan o'tmaydi — shuning uchun mijoz yangi xizmat **qo'sha
oladi**, lekin tahrirlay ham, o'chira ham olmaydi, va "Saqlash" bosilgandan
keyin saytda hech narsa o'zgarmaydi (chunki saqlash umuman bajarilmagan).

Prod loglarida 2026-08-12 08:09:50, 08:10:31, 08:10:39 da aynan shu xato,
`services_id`, `id=4` bilan uch marta — mijozning uch urinishi.

Prod bazasining nusxasida takrorlandi va tuzatish tasdiqlandi:

| Amal | Hozirgi prod | +2 ustun |
|---|---|---|
| `findByID` services/4 | ✅ | ✅ |
| `update` services/4 | ❌ | ✅ |
| `update` projects/2 | ❌ | ✅ |
| `delete` services | ❌ | ✅ |
| `create` services | ✅ | ✅ |

**Ildiz sabab (arxitektura darajasida):** `scripts/db-ensure.ts` faqat
**yetishmayotgan jadvalni** qo'sha oladi, **yetishmayotgan ustunni** emas —
CLAUDE.md da bu ochiq zaiflik sifatida yozilgan. `testimonials` va
`submissions` kolleksiyalari qo'shilgan deploy'da jadvallar yaratildi, lekin
mavjud `payload_locked_documents_rels` jadvaliga kerakli ikki ustun qo'shilmadi.
Bu tuzatilmasa, quyidagi har bir faza xuddi shu tuzoqqa tushadi.

### #2, #9a — Sayt bir tilda

`payload.config.ts` da `localization` bloki yo'q, hech bir maydonda
`localized: true` yo'q. `components/Header.tsx` dagi tanlagich faqat
`<html lang>` ni almashtiradi va `localStorage` ga yozadi.

### #3 — Xizmatlar sahifasining muqovasi kodda

`app/(site)/services/page.tsx:38` — `src="/sd2.webp"` qattiq yozilgan.

### #4 — Portfolioga video yuklab bo'lmaydi

`collections/Media.ts` da `mimeTypes` cheklovi yo'q, lekin `imageSizes` va
`resizeOptions` bor va sharp video faylni qayta ishlay olmaydi. `lib/content.ts`
`gallery` ni faqat `string[]` (URL) sifatida qaytaradi — turini bilmaydi, ya'ni
sayt `<video>` chizishga ma'lumotga ega emas.

### #5 — «Biz haqimizda» kodda

`app/(site)/about/page.tsx` — hikoya matni to'g'ridan-to'g'ri JSX da,
`values` va `team` esa `data/team.ts` da.

### #6 — Mobilda logotiplar skrollda yo'qoladi

`.sado-marquee-mask` (`globals.css:398`) `mask-image` ni **hamma ekranda**
qo'llaydi, ustiga `.sado-marquee` cheksiz `transform` animatsiyasi va
`img { filter: invert() }` (`:147`) qo'shiladi. iOS Safari / mobil Chrome bu
uch qatlamni birga ko'targanda skroll paytida kompozitsiya qatlamini tashlab
yuboradi. Otzivlar qatorida (`.sado-rail-mask`) mask allaqachon
`@media (min-width: 768px)` ichida — logotiplarda esa emas.

### #7 — Mobil hero'da desktop va mobil kadrlar aralashadi

`components/HeroSlideshow.tsx:112` — `const mobileSrc = imagesMobile[i]`.
Mijoz 5 ta desktop va 3 ta mobil kadr yuklasa, 4- va 5- kadrlarda `undefined`
qaytadi va telefon desktop kadrini ko'rsatadi.

### #8 — Blog muqovasi turli nisbatlarda qirqiladi

`components/BlogCard.tsx:11` → `aspect-[4/3]`;
`app/(site)/blog/[slug]/page.tsx:69` → `aspect-[4/3]` mobilda,
`aspect-[21/9]` desktopda. Bitta rasm uch xil nisbatda `object-cover` bilan
kesiladi.

### #9b — Blog muharriri juda sodda

`panel/lexical.ts` sarlavha (`##`), iqtibos (`>`), ro'yxat (`-`, `1.`) va kod
blokini **qo'llab-quvvatlaydi**, lekin bu faqat markdown sintaksisi orqali va
`panel/BlockEditor.tsx` da hech qanday tugma yo'q — mijoz bu imkoniyat borligini
bilmaydi. Qalin, kursiv va havola esa umuman yo'q (`INLINE_SAFE` faqat `text`,
`linebreak`, `tab`).

---

## 2. Ma'lumot xavfsizligi qoidalari (butun reja davomida)

1. **Har deploy oldidan prod bazasi zaxirasi.** `docker cp` bilan lokalga
   nusxa + konteyner ichida `db.sqlite.bak`.
2. **Hech qachon `DROP`.** Faqat `ADD COLUMN` va `CREATE TABLE` — ikkalasi ham
   mavjud qatorlarga tegmaydi.
3. **Har bir yangi kolleksiya/globalga zaxira qiymat.** Jadval bo'sh bo'lsa
   sayt kodda turgan matnni ko'rsatadi (`getTestimonials` naqshi). Busiz yangi
   jadval qo'shilgan deploy'dan keyin sahifa bo'sh chiqadi.
4. **Har bir sxema o'zgarishidan keyin:** `bunx payload generate:types` +
   `schema.sqlite` ni qayta yaratish, ikkalasi ham commit qilinadi.
5. **Har faza alohida deploy va alohida tekshiruv.** Bir deploy'da ikki faza
   yo'q — yiqilsa qaysi biri ekani noma'lum bo'lib qoladi.

---

## 3. Fazalar

### Faza 0 — Prod bazasini darhol tuzatish (deploy'siz)

Konteyner ichida, `bun:sqlite` orqali:

```sql
ALTER TABLE payload_locked_documents_rels ADD COLUMN testimonials_id integer;
ALTER TABLE payload_locked_documents_rels ADD COLUMN submissions_id integer;
CREATE INDEX payload_locked_documents_rels_testimonials_id_idx
  ON payload_locked_documents_rels (testimonials_id);
CREATE INDEX payload_locked_documents_rels_submissions_id_idx
  ON payload_locked_documents_rels (submissions_id);
```

Oldidan `db.sqlite` nusxasi olinadi. `ADD COLUMN` mavjud qatorlarni
o'zgartirmaydi (yangi ustun `NULL` bo'ladi), `payload_locked_documents_rels`
esa umuman vaqtinchalik qulf jadvali — unda mijoz kontenti yo'q.

SQLite `ADD COLUMN` da `REFERENCES … ON DELETE cascade` ni qabul qilmaydi
(faqat `NULL` sukut qiymati bilan), shuning uchun ustunlar tashqi kalitsiz
qo'shiladi. Payload bu ustunlarni faqat o'qish/yozish uchun ishlatadi,
cascade esa `payload_locked_documents` o'chirilganda kerak — u `parent_id`
orqali baribir ishlaydi.

**Tekshirish:** paneldan bitta xizmat tahrirlanadi va saytda ko'rinishi
tasdiqlanadi.

### Faza 1 — `db-ensure` ustun qo'shishni ham bilsin

`scripts/db-ensure.ts`: mavjud jadvallar uchun `PRAGMA table_info` ni
`schema.sqlite` bilan solishtirib, yetishmayotgan ustunlarni
`ALTER TABLE … ADD COLUMN` bilan qo'shadi va o'sha ustunning indekslarini
`schema.sqlite` dagi `sqlite_master` dan olib yaratadi.

Cheklov: `ADD COLUMN` `NOT NULL` ustunni sukut qiymatisiz qo'sha olmaydi —
bunday holat log'ga yoziladi va o'tkazib yuboriladi (qo'lda hal qilinadi).
Ustun **o'chirish** va **nom o'zgartirish** hamon aniqlanmaydi va ataylab
shunday: ikkalasi ham ma'lumot yo'qotishi mumkin.

`scripts/db-ensure.test.ts` ga yangi testlar: ustun qo'shiladi, mavjud qator
saqlanadi, indeks yaratiladi, `NOT NULL` holati o'tkazib yuboriladi.

Bu faza qolgan hamma sxema o'zgarishini xavfsiz qiladi — shuning uchun u
boshqa hamma narsadan oldin.

### Faza 2 — Frontend tuzatishlari (sxemaga tegmaydi)

* **#6** — `.sado-marquee-mask` ni `@media (min-width: 768px)` ichiga olish
  (otzivlar qatoridagi kabi). `filter: invert()` ni animatsiya konteyneridan
  chiqarib, `img` ning o'ziga qoldirish yetarli bo'lmasa, mobilda maskni
  butunlay o'chirish.
* **#7** — `HeroSlideshow`: `imagesMobile` bo'sh bo'lmasa, mobil `<source>`
  **faqat** mobil massivdan oladi (`imagesMobile[i % imagesMobile.length]`),
  ya'ni telefonda hech qachon desktop kadri chiqmaydi. Massiv butunlay bo'sh
  bo'lsagina eski xatti-harakat (desktop kadri) saqlanadi.
* **#8** — muqova nisbati bir joyga yig'iladi: `BlogCard` ham, maqola sahifasi
  ham **16:9**. Panelda muqova yuklash maydoniga tavsiya matni qo'shiladi.

### Faza 3 — Xizmatlar muqovasi (#3) va portfolio video (#4)

**#3:** `globals/Settings.ts` ga `pages` guruhi va uning ichiga
`servicesCover` (upload). `app/(site)/services/page.tsx` uni `getSettings()`
dan oladi, bo'sh bo'lsa `/sd2.webp` ga qaytadi. Panel: `SettingsForm` ga
bitta `ImageDrop`.

**#4:** `collections/Media.ts` — `mimeTypes` ga `video/mp4`, `video/webm`
qo'shiladi. Payload video faylga sharp qo'llamaydi (`imageSizes` faqat rasmga
tegishli). `app/api/panel/upload` va `panel/ImageDrop.tsx` video MIME'ni
qabul qiladi va oldindan ko'rsatishda `<video>` chizadi.

`lib/content.ts` da `gallery: string[]` → `gallery: MediaItem[]`
(`{ url, mimeType, width, height }`). `data/projects.ts` dagi `Project` tipi
mos ravishda o'zgaradi. Loyiha sahifasi element `video/*` bo'lsa
`<video autoplay muted loop playsinline preload="metadata">` chizadi —
boshqaruvsiz, gif kabi.

Ehtiyot chorasi: video fayl og'ir bo'ladi. Yuklash chegarasi (masalan 20 MB)
va panelda ogohlantirish qo'yiladi.

### Faza 4 — «Biz haqimizda» to'liq paneldan (#5)

Yangi global `About` (`globals/About.ts`):

* `lead` — sahifa boshidagi qisqa tavsif
* `story` — ikkita xatboshi (`intro`, `mission`)
* `values` — massiv (`title`, `text`)
* `team` — massiv (`name`, `role`, `photo` upload)
* `contact` — sarlavha va qisqa matn

Sayt `lib/about.ts` orqali o'qiydi; **har bir maydon uchun zaxira** —
`data/team.ts` dagi `values` va `team`, hikoya matni esa hozirgi JSX dan
ko'chirilib `data/about.ts` ga qo'yiladi. Bo'sh global saytni bo'shatmaydi.

Panel: `panel/about-data.ts`, `panel/about-actions.ts`, `panel/AboutForm.tsx`,
`app/panel/(app)/biz-haqimizda/page.tsx` + `Nav.tsx` da bitta qator.
`values` va `team` uchun `SettingsForm` dagi `RepeatRows` ishlatiladi (u
qatorlarni indeks bilan emas, o'sib boradigan kalit bilan belgilaydi).

### Faza 5 — Blog muharririga formatlash paneli (#9b)

`panel/BlockEditor.tsx` dagi `TextBlock` ustiga tugmalar qatori:
**H2, H3, Qalin, Kursiv, Havola, Iqtibos, Ro'yxat, Raqamli ro'yxat**.

Tugma tanlangan matnni o'rab qo'yadi yoki qator boshiga belgi qo'yadi —
`textarea.setRangeText` bilan, ya'ni native undo saqlanib qoladi. Muharrir
`<textarea>` bo'lib qoladi: contenteditable ham, kutubxona ham qo'shilmaydi.

`panel/lexical.ts` ga uchta yangi inline belgi:

* `**qalin**` → `format: 1` bo'lgan text node
* `*kursiv*` → `format: 2`
* `[matn](url)` → `link` node

Bu `INLINE_SAFE` ro'yxatini kengaytiradi, ya'ni hozir `lossy` deb belgilanib
saqlashni to'sib turgan havolali hujjatlar yana tahrirlanadigan bo'ladi.
`panel/lexical.test.ts` har uch belgi uchun ikki tomonlama o'girma testi bilan
kengaytiriladi — **mavjud testlar o'chirilmaydi**.

Sayt tomonida `MDXRemote` bu sintaksisni allaqachon tushunadi.

### Faza 6 — Ikki tillilik: UZ + RU (#2, #9a)

Eng katta va eng xavfli faza, shuning uchun oxirida.

**Payload:** `localization: { locales: ['uz','ru'], defaultLocale: 'uz',
fallback: true }`. `localized: true` quyidagilarga:

* `projects`: `title`, `client`, `category`(yo'q — select qoladi), `services`,
  `brief`, `solution`, `results.label`, `results.value`
* `services`: `title`, `description`, `deliverables`, `fitFor`
* `posts`: `title`, `description`, `category`, `body`
* `testimonials`: `quote`, `role`
* `settings`: `hero.kicker`, `hero.heading`, `description`
* `about`: matnli maydonlarning hammasi

`slug` **lokalizatsiya qilinmaydi** — bitta manzil ikkala tilda. Bu mavjud
URL'larni saqlaydi va sitemap'ni sodda qoldiradi.

**Ma'lumot migratsiyasi (eng xavfli qadam).** SQLite adapteri lokalizatsiya
qilingan maydonlarni `<jadval>_locales` jadvaliga ko'chiradi. Yangi jadvallar
`db-ensure` orqali yaratiladi, **lekin mavjud kontent eski ustunlarda qolib
ketadi va sayt uni ko'rmay qoladi.** Shuning uchun `scripts/migrate-locales.ts`:

1. Bazadan nusxa oladi (`db.sqlite.pre-i18n.bak`).
2. Har bir jadval uchun eski ustun qiymatlarini `<jadval>_locales` ga
   `_locale = 'uz'` bilan ko'chiradi.
3. Ko'chirilgan qatorlar sonini eski qatorlar soni bilan solishtiradi va mos
   kelmasa **xato bilan to'xtaydi** (eski ustunlar o'chirilmaydi, ya'ni
   qaytarish mumkin).

Eski ustunlar **o'chirilmaydi** — ular ishlatilmay qoladi. Diskda bir necha
o'nlab kilobayt, evaziga to'liq qaytarish imkoniyati.

**URL sxemasi.** Mavjud manzillar o'zgarmaydi: `/portfolio/kiias` — o'zbekcha,
`/ru/portfolio/kiias` — ruscha. `middleware.ts` `/ru/*` ni `/*` ga rewrite
qiladi va `x-locale: ru` sarlavhasini qo'yadi; sahifalar `headers()` dan
o'qiydi. Bu `app/(site)` daraxtini qayta tuzmaydi va indekslangan URL'larni
buzmaydi.

`<html lang>`, `hreflang` juftliklari va canonical shu lokaldan quriladi;
`app/sitemap.ts` ikkala tilni ham chiqaradi.

**UI matnlari.** `lib/i18n.ts` — `{ uz: {...}, ru: {...} }` lug'at (~80 qator).
Server komponentlar `t(locale, key)` chaqiradi, client komponentlar (Header,
ContactForm, Select, Stats) lug'atni prop orqali oladi. Header'dagi tanlagich
`localStorage` o'rniga `<Link>` bilan `/ru/...` ga o'tadi.

**Panel.** Lokalizatsiya qilingan maydonlar `panel/ui.tsx` dagi tayyor
`LangTabs` bilan o'raladi (u ikkala tilni ham DOM'da ushlab turadi — biri
`hidden`, aks holda saqlashda ikkinchi til bo'shab qolardi). `panel/doc.ts`
dagi `at()` yordamchisi allaqachon `{uz, ru}` shaklini o'qiy oladi.
`saveLocalized` (massivli maydonlar uchun) qayta yoqiladi va sinaladi —
Payload massiv qatorlaridagi tarjimalarni qator `id` siz yozsang jimgina
yo'qotadi.

Maqola matni uchun `BlockEditor` har til uchun alohida nusxada chiziladi.

**EN keyinroq:** `locales` ro'yxatiga `'en'` qo'shish va lug'atga uchinchi
kalit — arxitektura shunga tayyor qoladi.

---

## 4. Har fazada tekshirish

`bunx tsc --noEmit` + `bun test` + `bun run build`, so'ng prod build'ni lokalda
(`bun run start`, port 3006) ochib ko'zdan kechirish. Hydration va rasm bilan
bog'liq narsalar **faqat** prod build'da tekshiriladi — dev'da rasm har safar
qaytadan optimizatsiya qilinadi va xato ko'rinmaydi.

Deploy'dan keyin har safar:

1. Prod bazasi zaxirasi olinganini tasdiqlash.
2. Sxema farqini tekshirish (jadval va ustun).
3. Paneldan bitta yozuvni tahrirlab, saytda ko'rinishini tasdiqlash.
4. Konteyner loglarini xatolarga tekshirish.

---

## 5. Ushbu rejaga kirmaydigan narsalar

* Ingliz tili — arxitektura tayyor qoladi, kontent kiritilmaydi.
* Payload'ning o'z `/admin` paneli (hozir 404, shunday qoladi).
* Contact formadan xabarnoma (email/Telegram) — hamon TODO.
* To'liq CSP (nonce va middleware talab qiladi).
* `data/*.ts` dagi "Placeholder matn:" prefiksli matnlar — ular prod bazasida
  yo'q, faqat lokal seed'da.
