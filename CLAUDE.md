# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

SADO — Toshkentdagi dizayn agentligi uchun marketing sayti. Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Payload CMS 3 (SQLite).

## Buyruqlar

Package manager: **bun** (`bun.lock` bor). `bun run dev` porti sifatida 3005 ishlatiladi (`.claude/launch.json`).

```bash
bun install
bun run dev             # dev server
bun run build           # productionga build
bunx tsc --noEmit       # type-check
bun test                # hamma testlar
bun test scripts/db-ensure.test.ts   # bitta fayl (yo'l bo'yicha filtr)
bun test -t "yangi jadval"           # bitta test (nom bo'yicha)
bunx payload generate:types   # payload-types.ts ni yangilash (kolleksiya o'zgargach)
bun scripts/seed.ts     # bo'sh bazani boshlang'ich kontent bilan to'ldirish
```

To'rtta test fayli bor: `panel/lexical.test.ts` (matn ⇄ Lexical o'girmasi),
`panel/rows.test.ts` (forma qatorlari va qator id'lari), `scripts/db-ensure.test.ts`
(sxema migratsiyasi), `scripts/migrate-locales.test.ts` (lokalizatsiya migratsiyasi).
Uchalasi ham **jimgina ma'lumot yo'qotadigan** joylarni qo'riqlaydi — o'chirmang.

Verifikatsiya = `bunx tsc --noEmit` + `bun test` + brauzerda ko'zdan kechirish.
**Brauzerda haqiqatan bosib ko'ring**, HTML'ni grep qilish yetarli emas: til
tanlagichning eng katta xatosi (manzil muzlab qolishi) faqat sahifadan sahifaga
o'tib bosgandagina ko'rinardi, `tsc` ham, testlar ham, HTML tekshiruvi ham jim edi. Seed va dev
server bir vaqtda ishlamaydi — ikkalasi ham SQLite sxemasini push qiladi va bir-birini kutib qoladi.

**Hydration bilan bog'liq narsani dev'da tekshirmang.** `.claude/launch.json` da
`prod` konfiguratsiyasi bor (`bun run start`, port 3006): `bun run build` dan keyin
shuni oching va sahifani **ikki marta** yuklang. Dev'da rasm har safar qaytadan
optimizatsiya qilinadi va sekin keladi, ya'ni hydration doim ulguradi — keshdan
kelgan rasm bilan bog'liq xatolar faqat shu yerda ko'rinadi (`HeroSlideshow` ni
qarang).

## Arxitektura

**Ikkita root layout.** `app/(site)/` — publik sayt (Header/Footer/globals.css), `app/panel/` —
CMS paneli (o'z `<html>`, `panel.css`). Ular alohida root bo'lgani uchun mos kelmagan URL'lar
`app/global-not-found.tsx` orqali sayt 404'ini qaytaradi — Next'ning zavod 404'i emas.

**Kontent Payload'da.** `collections/*.ts` sxema, `payload.config.ts` konfiguratsiya, baza —
`db.sqlite` (`DATABASE_URI`). Kolleksiyalar: `users`, `media`, `projects`, `services`,
`posts`, `testimonials`, `submissions`; globallar — `settings`, `about`. Sayt ularni faqat ikki
modul orqali o'qiydi:
- `lib/content.ts` — `getProjects`, `getProject`, `adjacentProjects`, `getServices`,
  `getTestimonials`
- `lib/blog.ts` — `getAllPosts`, `getPost`, `getBlogCategories`, `getRelatedPosts`
- `lib/about.ts` — `getAbout` (Biz haqimizda sahifasi)

Bu funksiyalar Payload hujjatlarini `data/projects.ts` / `data/services.ts` dagi **tiplarga**
o'giradi, shuning uchun komponentlar o'zgarmadi. O'sha fayllardagi massivlar va
`content/blog/*.mdx` endi faqat `scripts/seed.ts` uchun — ularni tahrirlash saytni o'zgartirmaydi.

**Kontent zaxirasi yo'q — to'ldirilmagan joy KO'RINMAYDI.** Otzivlar
(`getTestimonials`), «Biz haqimizda» matni, qadriyatlar va jamoa (`lib/about.ts`)
bo'sh bo'lsa bo'sh qaytadi, sahifa esa o'sha blokni butunlay yashiradi.

Ilgari ular `data/*.ts` dan zaxira olardi va mijoz haq edi: o'ylab topilgan
odam ("Aziz Rahimov, kreativ direktor") va uning maqtovi saytda haqiqiy
ma'lumot bo'lib turardi, va uni o'chirishning yo'li yo'q edi — paneldan
bo'shatsang kodagilar qaytib kelardi. **Yangi kolleksiyaga zaxira qo'shmang**;
o'rniga sahifada bo'sh holatni yashiring.

`data/team.ts`, `data/testimonials.ts` va `data/about.ts` o'chirilmadi —
ular `scripts/seed.ts` uchun. Mijoz logolari (`clients`) hali ham faqat kodda.

**Sayt so'rov paytida render qilinadi — `app/(site)/layout.tsx` dagi
`export const dynamic = "force-dynamic"` ni olib tashlamang.** Dockerfile build
paytida `cp schema.sqlite db.sqlite` qiladi (prodda volume hali yo'q), ya'ni
`next build` **bo'sh** bazani ko'radi. Statik qurilgan sahifalar o'sha bo'sh
holatni HTML'ga muhrlab qo'yardi va har deploy'dan keyin sayt mijoz kiritgan
hamma narsani "yo'q" deb ko'rsatardi — kontent joyida turgani holda.
`revalidatePath` buni faqat mijoz navbatdagi safar biror narsani saqlaganda
tuzatardi. `app/sitemap.ts` ham shu sababdan dinamik.

Maqola matni Payload'da Lexical formatida. `panel/lexical.ts` uni markdown bilan ikki tomonga
o'giradi: panelda `BlockEditor`, saytda `toText` → `MDXRemote`. `panel/lexical.test.ts` shu
o'girmani qo'riqlaydi — **o'chirmang**, undagi drift mijozning yozganini yo'qotadi.

Sintaksis: `## ` `### ` `- ` `1. ` `> ` va fenced kod bloki qator darajasida;
`**qalin**`, `*kursiv*`, `[matn](url)` esa **inline**, ya'ni sarlavha, iqtibos va
ro'yxat bandi ichida ham ishlaydi. Uchala inline belgi `BlockEditor` dagi tugmalar
qatori orqali qo'yiladi — sintaksisning o'zi ilgari ham bor edi, lekin ekranda hech
qanday ishora yo'q edi va mijoz faqat yalang'och xatboshi yoza olardi.

Ifodalab bo'lmaydigan format (tagi chizilgan, o'chirilgan, inline kod — bitmask
`~3`) va URL'siz ichki havola `lossy` deb belgilanadi: muharrir ogohlantirish
chiqaradi va saqlashni to'sadi. Ilgari qalin matn ham jimgina oddiy matnga
aylanardi — tekshiruv umuman yo'q edi.

**Panel** (`/panel`). Ekranlar qo'lda yozilgan, sxemadan generatsiya qilinmagan: `panel/` —
toolkit (`ui.tsx`, `ItemList`, `ImageDrop`, `BlockEditor`, `auth.ts`), `app/panel/(app)/` —
ekranlar. Kolleksiya yoki global qo'shish = 4 ta fayl (`<x>-data.ts`, `<x>-actions.ts`,
`<X>Form.tsx`, `app/panel/(app)/<nom>/`) + `Nav.tsx` da bitta qator. Har bir server action `requireUser()` bilan
boshlanadi — action o'z HTTP kirish nuqtasi, layout'ning qorovuli uni qamramaydi.

Rasmlar **forma ichida** yuklanadi: `panel/ImageDrop.tsx` (`ImageDrop` — bitta rasm,
`ImageStack` — galereya) va `BlockEditor` fayllarni `POST /api/panel/upload` ga `fetch`
bilan yuboradi. Forma yuborilmaydi, sahifa qayta yuklanmaydi, yozilgan matn yo'qolmaydi —
shuning uchun bu server action emas, route handler. Sudrab tashlash, Cmd+V va tanlash
uchtasi ham ishlaydi; `/panel/rasmlar` esa umumiy kutubxona sifatida qoladi.

Alt matni yuklashda so'ralmaydi (oqimni to'xtatadi) — fayl nomidan qo'yiladi va rasm
ostida tahrirlanadi (`PATCH /api/panel/upload`). Fayllar `media/` da,
`/api/media/file/<nom>` orqali uzatiladi (`app/(payload)/api/[...slug]`).

**Video faqat loyiha galereyasida.** `ImageStack` `video` prop'i bilan MP4/WebM ni ham
qabul qiladi (20 MB gacha; rasm chegarasi 8 MB), `ImageDrop` esa faqat rasm — muqova
`next/image` orqali ketadi va OG rasmi ham o'shandan olinadi, ya'ni videoni u yerga
qo'ysa bo'lmaydi. Shu sabab **kutubxonadan tanlash to'rida ham** `ImageDrop` videolarni
ko'rsatmaydi. Payload sharp'ni faqat rasm MIME'lariga qo'llaydi, ya'ni `imageSizes` va
`resizeOptions` videoga tegmaydi — `Media` konfiguratsiyasiga ham, sxemaga ham o'zgarish
kerak emas.

Video-mi yoki rasm-mi degan savolga `lib/site-format.ts` dagi `isVideo(url)` javob
beradi — **kengaytma bo'yicha**, MIME bo'yicha emas. `Project.gallery` URL massivi
bo'lib qoladi: MIME'ni olib yurish uchun uni obyektlar massiviga aylantirish
`data/projects.ts` ni, `lib/content.ts` ni, panel yuklovchisini va sayt sahifasini bir
vaqtda o'zgartirish degani bo'lardi. Payload media URL'i har doim asl fayl nomi bilan
tugaydi, ya'ni kengaytma bor.

**Serverda `file.type` ga ISHONMANG — Bun uni fayl nomidan qayta hisoblaydi.**
`request.formData()` client yuborgan MIME turini tashlab yuboradi va uni
kengaytmadan tiklaydi, ustiga katta-kichik harfni farqlab (o'lchangan,
bun 1.3.10):

```
kadr.mp4  → "video/mp4"      IMG_4821.MOV → ""
kadr.MP4  → ""               kadr         → ""
```

iPhone va kameralar videoni aynan `IMG_1234.MOV` deb saqlaydi, ya'ni mijoz
videosini yuklay olmagani shundan edi: client tekshiruvidan o'tardi (brauzer
to'g'ri MIME beradi), serverda esa bo'sh tur ko'rinardi va fayl rad etilardi.
Yechim — `panel/upload-limits.ts` dagi `resolveUploadType()`: tur tanilsa
o'shani oladi, aks holda kengaytmadan tiklaydi. **Payload'ga ham o'sha
tiklangan tur uzatiladi**, aks holda media bo'sh `mimeType` bilan yozilardi.

Ruxsat etilgan turlar, chegaralar va rad etish xabari — hammasi
`panel/upload-limits.ts` da, **yagona manba**. Client (`ImageDrop`), route
(`app/api/panel/upload`) va server action (`panel/media-actions.ts`) uchalasi
shundan o'qiydi. Ilgari client `image/*` ni o'tkazardi, server esa beshta
turni bilardi — mos kelmagan fayl client tekshiruvidan o'tib serverda
yiqilardi. **Rad etish xabari qabul qilingan turni AYTISHI shart**; usiz
sabab na mijozga, na bizga ko'rinmaydi. `panel/upload-limits.test.ts` shu
xatti-harakatlarni qo'riqlaydi.

Saytda video gif kabi chiqadi: `muted loop autoPlay playsInline`, boshqaruvsiz.
`muted` shart — usiz mobil brauzerlar avtoijroni butunlay bloklaydi.

**Qoralama va avtosaqlash.** `posts` va `projects` da `versions: { drafts: true }`. Forma
o'zgargach 2s jimlikdan keyin `POST /api/panel/autosave` qoralama yozadi (`draft: true`) —
qoralamada majburiy maydonlar tekshirilmaydi, shuning uchun yarim yozilgan matn ham
saqlanadi. "Saqlash va chop etish" tugmasi esa `_status: 'published'` qo'yadi.

Sayt faqat chop etilganini o'qiydi (Payload `find` sukut bo'yicha shunday), panel esa
`draft: true` bilan eng oxirgi holatni ko'radi — `findRaw` va ro'yxat ekranlari. Forma
ma'lumotini yig'ish `panel/form-map.ts` da: action ham, avtosaqlash route'i ham shundan
o'qiydi, aks holda qoralama chop etilgandan boshqacha saqlanib qolardi.

Avtosaqlash faqat **mavjud** yozuv uchun: yangi maqolada har bir tugmacha yangi hujjat
yaratib ketardi, shuning uchun birinchi "Saqlash" dan keyin yoqiladi.

**Sozlamalar globali.** `globals/Settings.ts` — mijoz o'zgartiradigan sayt matni: bosh
sahifaning birinchi ekrani (matn + `heroImages`), xizmatlar sahifasining muqovasi
(`servicesCover`), aloqa ma'lumotlari, ishonch bandidagi
`stats` raqamlari, ijtimoiy tarmoqlar, meta tavsif. Sayt uni `lib/getSettings()` orqali
o'qiydi. Hero matni, meta tavsif va standart rasmlar uchun zaxira bor
(`lib/i18n.ts` dagi `hero.*` kalitlari — ular ham tarjima qilinadi; hero
rasmlari `public/sd1–sd5`, xizmatlar muqovasi `public/sd2.webp`). Bu
zaxiralar qoladi: bo'sh hero saytni buzardi, bo'sh jamoa esa yo'q.

**`servicesCover` Sozlamalar EKRANIDA emas.** U texnik jihatdan shu globalning
maydoni, lekin panelda `/panel/xizmatlar` da chiziladi
(`panel/ServicesCoverForm.tsx`, `saveServicesCover`) — mijoz muqovani
almashtirish uchun tabiiy ravishda «Xizmatlar» bo'limiga kiradi va uni
Sozlamalardan topmaydi. Alohida action, chunki `saveSettings` butun globalni
yozadi va u yerdan chaqirilsa formada yo'q maydonlarni bo'shatib yuborardi.

Sayt nomi, manzili
va navigatsiya tuzilishi kodda qoladi — ular kontent emas. Hero'ni `HeroSlideshow` (client,
JS crossfade) render qiladi — rasm soni paneldan kelgani uchun har qanday songa moslashadi.

**«Biz haqimizda» globali.** `globals/About.ts` — sahifaning hammasi:
kirish matni (`intro.lead/story/mission`), «Qanday ishlaymiz» kartalari
(`values`), jamoa (`team` — ism, lavozim, surat) va aloqa bandining
sarlavhalari. Sayt uni `lib/about.ts` orqali o'qiydi. Zaxira **maydon
darajasida**: mijoz faqat hikoyani yozsa jamoa `data/team.ts` dan chiqib
turaveradi, global umuman bo'sh bo'lsa sahifa avvalgidek ko'rinadi. Raqamlar
bu yerda emas, Sozlamalarda (`stats`) — ular bosh sahifada ham ishlatiladi.

To'rtinchi qadriyat kartasi («Ish muhiti») ilgari `about/page.tsx` da qo'lda
yozilgan edi: uchtasi massivdan, bittasi JSX dan chiqardi va paneldagi ro'yxat
saytdagini to'liq aks ettirmasdi. Endi u ham `data/team.ts` dagi `values` da.

**O'zgaruvchan sonli qatorlar — `RepeatRows` (`panel/ui.tsx`).** Raqamlar,
ijtimoiy tarmoqlar, qadriyatlar va jamoa shuni ishlatadi. U qatorni **indeks
bilan emas, o'sib boradigan kalit bilan** belgilaydi: `Field`
boshqarilmaydigan input ustiga qurilgan, indeks bilan kalitlanganda
o'rtadagi qator o'chirilsa React DOM tugunini qayta ishlatardi va ekranda
o'chirilgan qatorning matni qolib ketardi. `kind: 'image'` bo'lgan maydon
`ImageDrop` chizadi (jamoa surati).

Teskari yo'nalish — `panel/rows.ts` dagi `readRows`: `<prefix>.<i>.<maydon>`
kalitlarini o'qiydi, indekslarni **raqam sifatida** saralaydi (matn bo'yicha
saralansa 10-qator 2-qatordan oldin kelardi) va to'ldirilmagan qatorni
tashlaydi. `optional` ro'yxatidagi maydon bo'sh bo'lishi mumkin — suratsiz
jamoa a'zosi saytda bosh harflari bilan chiqadi. `panel/rows.test.ts` shu
to'rt xatti-harakatni qo'riqlaydi; ular buzilsa mijozning yozgani jimgina
yo'qoladi. Modul ataylab `form-map.ts` da emas: u `server-only` ni tortadi
(`slugify` orqali) va sinovdan o'tkazib bo'lmasdi.

**`Stats` — client komponent va qiymatni prop orqali oladi.** `lib/settings.ts`
dan **qiymat** import qilib bo'lmaydi (u Payload'ni tortadi va build yiqiladi) —
sahifa server tomonda o'qiydi, komponentga tayyor massiv keladi.

**Rasm = LCP. Ikki qoida buzilmasin.** Sayt rasmlari `next/image` orqali ketadi (istisno:
mijoz logolari — o'nlab turli nisbatda, ular tayyor 224px WebP va `fetchPriority="low"`).
**Logolarga `loading="lazy"` qo'ymang.** Ularda width/height yo'q (`w-auto`), ya'ni
yuklanmagunicha quti 0×40px bo'ladi va nol maydonli element hech qachon viewportga
"kirmaydi" — lazy yuklash ishga tushmaydi, rasm kelmaydi, quti 0 bo'lib qolaveradi.
Prodda o'lchandi: 20 tadan 0 tasi yuklangan, lenta 912px sof `gap` bo'lib turgan.
Xuddi shu tuzoq width'siz har qanday `<img>` ga tegishli.
Hero'da esa faqat **birinchi kadr** darrov yuklanadi, qolganlari o'sha kadr chizilgach
mount bo'ladi: beshtasi barobar yuklanganda LCP rasm bandwidth talashib qolardi. Bu
o'lchangan regressiya — hero 6.8 MB PNG'da, `<img>` bilan turganda mobil LCP 42 s edi.
Manba fayllar ham WebP: `next/image` baribir siqadi, lekin og'ir manba Docker image'ni
va har bir sovuq optimizatsiyani qimmatlashtiradi.

**Hero'da telefon uchun alohida kadr.** Telefon ekrani ~1:2, hero rasmlari 16:9 —
`object-cover` bilan kadrning ~28% i ko'rinardi. Sozlamalardagi `heroImagesMobile`
(tik kadrlar, tavsiya 9:16) `<picture>` + `<source media="(max-width: 767px)">` orqali
768px dan tor ekranda chiqadi; bo'sh bo'lsa desktop kadriga qaytadi. Ikkita `<Image>`
va `hidden`/`block` **emas**: yashirilgan rasmni ham brauzer yuklaydi, ya'ni telefon
ikkala kadrni ham tortardi. Shu sabab `getImageProps` — u `srcSet` beradi va uni
`<source>` ga qo'yish mumkin. `sizes` esa `115vw`, `100vw` emas: `object-cover` rasmni
oynadan kattaroq qilib cho'zadi va `100vw` da mobilda 375px variant 894px ga cho'zilib
bulanardi.

Tik kadrlar **aylanib takrorlanadi** (`imagesMobile[i % imagesMobile.length]`), massiv
bo'sh bo'lgandagina desktop kadriga qaytiladi. Ilgari `imagesMobile[i]` edi va mijoz
desktopdan kam tik kadr yuklasa qolganlari `undefined` bo'lib desktop rasmiga tushardi:
telefonda slayd-shou yotiq va tik kadrlarni aralashtirib ko'rsatardi.

**Blog muqovasi hamma joyda 16:9.** `BlogCard` ham, maqola sahifasi ham. Ilgari karta
4:3, maqola esa mobilda 4:3 va desktopda 21:9 edi — bitta rasm uch xil qirqilardi.
16:9 tanlangani `Media` dagi `wide` hosilasi (1600×900) bilan bir xil bo'lgani uchun.

**Client komponentga `lib/settings.ts` dan qiymat import qilmang.** U Payload'ni tortadi,
Payload esa sharp va nodemailer'ni — build `child_process` topilmadi deb yiqiladi. Tip va
sof yordamchilar `lib/site-format.ts` da (direktivasiz, Payload'ga tegmaydi).

**Parol tiklash.** `/panel/parol` → Payload `forgotPassword` token yaratadi → xat
`/panel/parol/yangilash?token=…` ga havola beradi (`collections/Users.ts` dagi
`generateEmailHTML`; Payload'ning zavod havolasi o'chirilgan `/admin` ga ketardi). SMTP
sozlanmagan bo'lsa xat server konsoliga yoziladi — oqim dev'da to'liq ishlaydi,
productionda `.env` dagi to'rtta SMTP qiymati kerak. `nodemailer` `next.config.mjs` da
`serverExternalPackages` ro'yxatida.

**Xavfsizlik sarlavhalari `next.config.mjs` da**, Traefik'da emas — proxy o'zgarsa ham
sayt ularni o'zi bilan olib yuradi: HSTS, `X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, COOP va `Content-Security-Policy: frame-ancestors 'self'`. CSP ataylab
shu bitta direktiva bilan cheklangan — to'liq XSS siyosati har so'rovga nonce talab qiladi
(`layout.tsx` dagi FOUC skripti va Next'ning bootstrap'i inline), ya'ni middleware; hozircha
u yozilmagan. HSTS'da `preload` yo'q: u ro'yxatga tushgach qaytarib bo'lmaydi.

## SEO

2026-08-15 dagi audit natijalari. Har biri jonli saytda o'lchangan xatodan
keyin — o'zgartirishdan oldin sababini o'qing.

**Sahifa sarlavhasi `<h1>` bo'lishi shart.** `SectionHeading` sukut bo'yicha
`<h2>` chizadi (u seksiya boshi), sahifaning O'Z sarlavhasi esa `as="h1"`
oladi. `/portfolio`, `/services`, `/about` va `/blog` uzoq vaqt `h1` siz
turgan: to'rtala landing sahifa mavzusini bildiruvchi eng kuchli signalsiz edi.

**OG rasmi PNG, hech qachon SVG.** Facebook, Instagram, LinkedIn, Telegram va
X ning hech biri `image/svg+xml` ni oldindan ko'rish rasmi sifatida chizmaydi
— bu yerda `og.svg` turgan va sayt havolasi qayerda ulashilsa rasmsiz
chiqardi. `public/images/og-uz.png` va `og-ru.png` (1200×630),
`width`/`height`/`alt` bilan. Ular Chrome headless orqali chizilgan; sharp
bilan qayta chizmang — uning SVG renderida shrift yo'q va **matn jimgina
tushib qoladi** (tekshirilgan: faqat fon va qizil nuqta chiqdi).

**Detal sahifada `openGraph` ni ALMASHTIRADI, qo'shmaydi.** Next sahifadagi
`openGraph` obyektini layout'dagisi bilan birlashtirmaydi, shuning uchun
`siteName` va `locale` blog va loyiha sahifalarida qo'lda takrorlanadi.
Ularsiz ulashilgan kartada "SADO" yorlig'i chiqmasdi.

**Media route'da `HEAD` bor va u `GET` metodi bilan qayta so'raydi.**
Ijtimoiy tarmoq skraperlari rasmni yuklashdan oldin `HEAD` yuboradi;
Payload'ning ichki routeri `HEAD` uchun yo'l topmay 404 qaytaradi, shuning
uchun `app/(payload)/api/[...slug]/route.ts` da so'rov `GET` bo'lib qayta
quriladi. Handler'ni "soddalashtirib" so'rovni to'g'ridan-to'g'ri uzatsangiz
404 qaytadi.

**JSON-LD `components/JsonLd.tsx` orqali** — `<` belgisi `<` ga
almashtiriladi va bu xavfsizlik uchun: sxemaga kiradigan matn paneldan keladi
va ichida `</script>` bo'lgan sarlavha skript blokini erta yopardi. Sxemalar
`lib/jsonld.ts` da, Payload'ga tegmaydi (ma'lumot argument bilan keladi).
Organization — faqat bosh sahifada, Article — blog maqolasida, BreadcrumbList
— maqola va loyihada. `Organization.logo` maxsus kvadrat PNG
(`public/images/logo.png`), `icon.svg` emas.

**Sitemapda har sahifa IKKI yozuv** — o'zbekchasi va ruschasi, ikkalasida ham
to'liq `alternates` (`uz`, `ru`, `x-default`). Ilgari `<loc>` faqat o'zbekcha
edi. **`lastModified` ni bilmasangiz bermang:** u yerda `new Date()` turgan va
sitemap har so'rovda "hamma sahifa hozirgina o'zgardi" derdi — Google bunday
`lastmod` ga ishonishni to'xtatadi.

**`robots.ts` da `/api/` yopiq, lekin `/api/media/file/` OCHIQ.** Butun
`/api` ni yopish Google Images'dan portfolioni olib tashlardi va ijtimoiy
tarmoqlardagi oldindan ko'rish rasmlarini sindirardi — yuklangan hamma narsa
shu yo'ldan uzatiladi.

**Favicon `app/icon.svg`** (Next fayl konvensiyasi), `public/` da emas — u
yerda turganda hech qayerdan ulanmay, sayt umuman faviconsiz qolgan edi.

Hali qilinmagani: `http://` → `https://` ko'chirishi Traefik'da va 302
(301 bo'lishi kerak) — u kodda emas, Coolify domen sozlamasida.

**Deploy (Coolify, Docker).** `Dockerfile` — bun install → `next build` (SSG sxemani
o'qish uchun `cp schema.sqlite db.sqlite`; SIGTRAP-on-exit `.next/BUILD_ID` bilan ajratiladi)
→ `docker-entrypoint.sh`. Prodda Payload sxema push qilmaydi va uni konteynerda Next'dan
tashqarida ishga tushirib bo'lmaydi (bun ostida payload CLI/tsx va lexical yiqiladi), shuning
uchun **sxema `schema.sqlite`** — sxema-only, 0 qatorli SQLite repoda commit qilingan.
Entrypoint ikkita skriptni ketma-ket ishlatadi: `db-ensure` (sxema), keyin
`migrate-locales` (kontent). Ikkinchisi birinchisiga bog'liq — `_locales`
jadvallari avval yaratilishi kerak.

`scripts/db-ensure.ts` (bun:sqlite, payload'siz) entrypoint'da uch ish qiladi: bo'sh
volume'ga sxemani ko'chiradi; sxemada bor **jadval** bazada yo'q bo'lsa (yangi kolleksiya)
uning CREATE'ini bajaradi; mavjud jadvalda **ustun** yetishmasa `ALTER TABLE ADD COLUMN`
qiladi va o'sha jadvalning yetishmayotgan indekslarini tiklaydi. Uchalasi ham qo'shuvchi
amal — kontent ham, foydalanuvchilar ham joyida qoladi (`scripts/db-ensure.test.ts` shuni
qo'riqlaydi). **Kolleksiya/global o'zgarsa:** `bunx payload generate:types`
(payload-types.ts, u ham commit qilinadi) + `schema.sqlite` ni qayta yarat
(`rm schema.sqlite && NODE_ENV=development DATABASE_URI=file:./schema.sqlite bun scripts/db-init.ts`).
Baza `/app/data`, rasmlar `/app/media` — Coolify volume'lari. Repoga push
= avtodeploy (GitHub App webhook).

**Ustun tekshiruvi nega bor.** U yo'q edi va 2026-08-12 da prodda quyidagi sodir bo'ldi:
`testimonials` va `submissions` qo'shilgan deploy'da jadvallari yaratildi, lekin mavjud
`payload_locked_documents_rels` ga `testimonials_id` va `submissions_id` ustunlari
qo'shilmadi. Payload har bir `update` va `delete` da qulf jadvalini tozalaydi
(`checkDocumentLockStatus` oxiridagi `db.deleteMany` — `overrideLock` dan **qat'i nazar**
bajariladi), o'sha so'rov polimorf `_rels` ga JOIN qiladi va yetishmayotgan ustunga
murojaat qiladi → `SQLITE_ERROR: no such column`. Mijoz paneldan yozuv **qo'sha olardi**
(`create` bu yo'ldan o'tmaydi), lekin tahrirlay ham, o'chira ham olmasdi va "Saqlash"
saytda hech narsani o'zgartirmasdi.

**`scripts/migrate-locales.ts` — lokalizatsiya migratsiyasi.** Maydonga
`localized: true` qo'yilganda Payload uni asosiy jadvaldan `<jadval>_locales`
ga ko'chiradi. `db-ensure` yangi jadvalni **bo'sh** yaratadi va eski ustunni
o'chirmaydi — ya'ni migratsiyasiz matn bazada qolib, Payload uni topmasdi va
sayt loyihalarni **nomsiz** ko'rsatardi. Skript ro'yxatni qo'lda emas,
`schema.sqlite` dan hisoblab oladi (13 jadval, 30+ ustun).

U bitta joyda `DROP` bajaradi va bu ataylab: Payload `update` ni upsert bilan
qiladi va yetim qolgan `NOT NULL` ustunni to'ldirmaydi →
`NOT NULL constraint failed: services.title` → **har qanday saqlash yiqiladi**.
Shuning uchun yangi sxemada yo'q + `NOT NULL` + sukut qiymatisiz + qiymati
ko'chirilgani tasdiqlangan ustunlar (9 ta) olib tashlanadi. Nullable yetimlar
(28 ta) tegilmaydi — orqaga qaytish yo'li ular orqali ochiq qoladi.
`scripts/migrate-locales.test.ts` shuni qo'riqlaydi.

**Qoralamasiz kolleksiyaga yangi MAJBURIY maydon qo'shsangiz `defaultValue` bering.**
Payload `required: true` ni `NOT NULL` qilib chiqaradi (`services.fit_for`), SQLite esa
sukut qiymatisiz `NOT NULL` ustunni `ALTER` bilan qabul qilmaydi — db-ensure uni
"QO'LDA KERAK" deb log'ga yozib o'tkazib yuboradi. `defaultValue` bo'lsa
`NOT NULL default …` chiqadi va migratsiya o'zi o'tadi (`services.order` shunday).
`projects` va `posts` da bu muammo yo'q: qoralama yoqilgani uchun ularning ustunlari
nullable. **Lokalizatsiya qilingan maydonga `required` qo'ymang** — Payload har tilni
alohida tekshiradi va mijoz ruschani kiritmaguncha o'zbekchani ham saqlab bo'lmasdi.
Formadagi HTML `required` o'z o'rnida qoladi. Hamon aniqlanmaydigani — ustun **o'chirilishi** va **nom o'zgarishi**; ataylab,
chunki ikkalasi ham ma'lumot yo'qotadi. Skript hech qachon `DROP` bajarmaydi.

**Loyiha turlari — `data/projects.ts` dagi `projectCategories`, yagona manba.**
Payload maydoni (`collections/Projects.ts`), paneldagi tanlagich
(`panel/ProjectForm.tsx`) va `/portfolio` dagi filtr uchalasi shundan o'qiydi.
Ilgari ro'yxat uch joyda qo'lda takrorlangan edi. Yangi tur qo'shish =
massivga bitta qator + `bunx payload generate:types`.

**Select maydoniga variant qo'shish baza migratsiyasini TALAB QILMAYDI.**
Payload SQLite'da `select` ni oddiy `text` qilib chiqaradi, `CHECK` yoki enum
yo'q (tekshirilgan: `category` → `text DEFAULT 'Branding'`). Ya'ni
`schema.sqlite` DDL'i o'zgarmaydi va `db-ensure` ga ish tushmaydi — mavjud
yozuvlar tegilmaydi. Sxemani qayta yaratsangiz DDL'ni solishtiring: bir xil
bo'lsa faylni commit qilmang, u faqat binar churn bo'ladi.

**Ikki til: UZ (asosiy) va RU.** `payload.config.ts` da `localization`,
`fallback: true` — tarjimasi bo'sh maydon o'zbekchasini ko'rsatadi, ya'ni yarim
tarjima ham xavfsiz.

**URL:** o'zbekcha prefiksisiz (`/portfolio/kiias`), ruscha `/ru` bilan
(`/ru/portfolio/kiias`). `proxy.ts` (Next 16 da `middleware.ts` shunday
ataladi) `/ru/...` ni `/...` ga rewrite qiladi va `x-locale` sarlavhasini
qo'yadi. Nega `app/(site)/[lang]/` emas: mavjud URL'lar indekslangan va
`[lang]` ularni `/uz/...` ga ko'chirardi. Til cookie'da emas, URL'da —
cookie bilan bitta manzil ikki xil sahifa qaytarardi va uni na qidiruv
tizimi, na kesh to'g'ri tushunardi.

Kontent o'quvchilari (`lib/content.ts`, `lib/blog.ts`, `lib/settings.ts`,
`lib/about.ts`) tilni **o'zlari** `lib/locale.ts` dan oladi, sahifalardan prop
sifatida emas: o'nga yaqin chaqiruv joyining biriga uzatish unutilsa o'sha
blok jimgina o'zbekcha bo'lib qolardi.

**Havolalar `components/LocaleLink.tsx` orqali.** Oddiy `next/link`
`/ru/portfolio` sahifasida prefiksni yo'qotib odamni o'zbekchaga qaytarardi.
Til context'dan keladi (`LocaleProvider`, sayt layout'ida). Istisno — til
tanlagichning o'zi: u prefiksni ataylab o'zi belgilaydi.

**Til tanlagich manzilni `usePathname()` bilan CLIENT tomonda oladi va
`<a>` bilan TO'LIQ YUKLASH qiladi.** Ikkalasi ham majburiy va ikkalasi ham
o'lchangan xatodan keyin:

* manzil server layout'idan prop bo'lib kelganda **muzlab qolardi** — Next
  client navigatsiyada umumiy layout'ni qayta render qilmaydi, ya'ni birinchi
  ochilgan sahifaning manzili oxirigacha saqlanardi va tugma odamni har safar
  o'sha sahifaga qaytarardi;
* `next/link` bilan almashtirilganda o'sha sababdan navigatsiya yorliqlari,
  futer va til context'i eski tilda qolardi — sahifa yarim tarjima bo'lib
  ko'rinardi.

`stripLocale(usePathname())` ikkala holatga chidaydi: rewrite ostida
`usePathname` `/blog` ham, `/ru/blog` ham qaytarishi mumkin.

**Interfeys matnlari `lib/i18n.ts` da** (~70 kalit), kontent esa Payload'da.
Yetishmagan ruscha kalit o'zbekchasiga qaytadi, ya'ni tarjima unutilgan joy
bo'sh emas. Client komponentlarga (`Header`, `ContactForm`, `BlogFilterGrid`,
`ClientsMarquee`, `Footer`) lug'at `m` prop'i bilan boradi — ular
`lib/settings.ts` dan qiymat import qila olmaydi.

`app/sitemap.ts` va layout'dagi `alternates` ikkala tilni `hreflang` juftligi
bilan beradi; usiz `/portfolio` va `/ru/portfolio` nusxa kontent bo'lib
hisoblanardi.

**`generateStaticParams` olib tashlandi** (`/portfolio/[slug]`, `/blog/[slug]`):
sayt `force-dynamic` bo'lgani uchun u hech qachon ishlatilmasdi, endi esa
`headers()` bilan to'qnashadi — build paytida so'rov yo'q.

`slug` lokalizatsiya qilinmaydi — indekslangan URL'lar buzilmasin. Rasm, aloqa,
ijtimoiy tarmoqlar, yil, tartib ham: ular hujjatga tegishli, tilga emas.
Ruscha ekranda ular umuman ko'rsatilmaydi va action ularni yozmaydi.

**Panelda til URL orqali:** `/panel/xizmatlar/1?til=ru` (`panel/locale.ts`,
`LangSwitch`). Yonma-yon tab emas — mijoz bir vaqtda bitta tilda yozadi va
ikkita to'plam maydon formani ikki barobar uzaytirardi. Yuklovchilar
`fallbackLocale: false` bilan o'qiydi: ruscha ekranda mijoz **o'zi
yozganini** ko'rishi kerak, aks holda bo'sh maydondagi o'zbekcha matn
saqlanganda ruscha bo'lib yozilib qolardi.

**Formaga `key={locale}` shart.** `Field` va `Area` boshqarilmaydigan input
ustiga qurilgan; kalitsiz React til almashganda komponentni qayta ishlatardi
va `<textarea>` eski tildagi matnni ekranda ushlab qolardi (o'lchangan:
`<input>` yangilanadi, `<textarea>` — yo'q).

**Massiv qatorlari `id` bilan saqlanadi.** `RepeatRows` har qatorga yashirin
`<prefix>.<i>.id` qo'yadi, `readRows` uni o'qiydi, action `rowId` orqali
uzatadi. Usiz Payload qatorlarni qaytadan yaratadi va **ikkinchi tildagi matn
`null` bo'lib ketadi** — o'lchangan, bu eng jimgina yo'qotish nuqtasi.
`rowId` id'ni **raqamga o'girmaydi**: Payload massiv qatorlariga matnli id
beradi (`6a78b734d1eac6b95233b0fe`) va `Number()` uni `NaN` qilardi.

Yangi yozuv faqat asosiy tilda yaratiladi (`slug` bo'sh qolmasin), tarjima
birinchi saqlashdan keyin.

**Rang tizimi — token orqali, hech qachon hardcode qilinmaydi.** Barcha ranglar `app/(site)/globals.css` `@theme` blokidagi CSS o'zgaruvchilar (`--color-pure-black` = fon, `--color-bone-white` = matn, `--color-fog-gray` = ikkinchi matn, `--color-graphite` = chiziq, `--color-soft-black` = ikkinchi fon, `--color-scarlet-signal` = yagona aksent). Tailwind bularni `bg-pure-black`, `text-fog-gray` kabi util sifatida taniydi.

- Token nomlari tarixiy (dark-first) lekin qiymatlari **semantik** — light modeda `bone-white` qora bo'ladi. Yangi komponentda hardcoded hex yoki `bg-white`/`text-black` ishlatmang, aks holda light mode buziladi.
- **Light/dark mode:** header'dagi toggle `<html data-theme>` ni o'zgartiradi va `localStorage.theme` ga saqlaydi; `app/(site)/layout.tsx` inline skripti FOUC oldini olish uchun birinchi bo'yashdan oldin qo'llaydi. `data-theme` tizim sozlamasidan (`prefers-color-scheme`) ustun turadi.

**Tipografika.** `Inter Tight` (`next/font`, `--font-sans` o'zgaruvchisi orqali `app/(site)/layout.tsx` da). Sarlavha darajalari `.display` (hero/CTA) va `.heading` (seksiyalar) — `globals.css` da `clamp()` bilan. Seksiya oʻlchamlari `text-subheading`/`text-heading-sm` tokenlarda.

**Seksiya naqshi.** Bosh sahifa seksiyalari izchil ritmda, hairline `border-t border-graphite` + kulrang kicker (`SectionHeading` komponenti buni inkassa qiladi).

**Vertikal ritm — token orqali, `pt-[160px]` deb yozmang.** `globals.css` `@theme` da
`--spacing-section-lg` / `-section` / `-section-sm` / `-stack` / `-card`, ya'ni
`pt-section`, `mt-stack`, `p-card`. Ular 768px dan pastda kichrayadi (240→88, 160→72,
120→56, 64→40, 32→20). Ilgari har bir seksiya o'z qiymatini qo'lda olib yurardi va
mobilda qisqarmasdi: 375px ekranda bosh sahifa 11 ekranga cho'zilardi. **Yangi mobil
qiymat qo'shganda `md:` dan foydalaning, `lg:` dan emas** — desktop chegarasi 768px, va
`lg:` bilan yozilgan tuzatish 768–1023px oralig'ida qo'llanmay qoladi.

**Yangi `--spacing-*` tokeni qo'shsangiz nomini tekshiring.** Tailwind undan
`p-<nom>`, `w-<nom>`, `inline-<nom>` va boshqa util'lar yasaydi — ya'ni token nomi
util nomiga aylanadi. Bu token bir muddat `--spacing-block` deb atalgan edi va
`.inline-block { inline-size: 64px }` chiqarib, Tailwind'ning `display: inline-block`
util'i ustiga yozib qo'ygan: saytdagi har bir `inline-block` element 64px enga
cho'zilgan, `RedDotLink` dagi 6px qizil nuqta uzun chiziqqa aylangan. `block`,
`full`, `auto`, `none`, `px` kabi nomlarni ishlatmang.

**Mobilda barmoq uchun 44px.** Matn havolasiga `.tap` klassi vertikal padding beradi
(faqat <768px). Salbiy margin ataylab yo'q: u qo'shni havolalarning bosish maydonlarini
ustma-ust tushirardi — o'rniga konteynerdagi `gap` kichraytiriladi.

**Otzivlar qatori mobilda marquee emas.** `.sado-rail` animatsiyasi va
`.sado-rail-mask` `@media (min-width: 768px)` ichida. Telefonda `hover` yo'q, ya'ni
suzib ketayotgan otzivni to'xtatib o'qib bo'lmasdi; u yerda `overflow-x-auto snap-x`
qoladi, karta `w-[85vw]` (keyingisining cheti ko'rinib turadi — surish ishorasi), va
takror `<li>` lar `max-md:hidden` — aks holda swipe uzunligi ikki baravar bo'lardi.

**Logotiplar qatorining maskasi ham mobilda o'chirilgan** — boshqa sababdan.
`mask-image` cheksiz `transform` animatsiyasi ustiga qo'yilganda mobil brauzer lentani
har kadrda dasturiy rasterlaydi va skroll paytida qatlamni tashlab yuboradi: logotiplar
sahifa surilganda yo'qolib qolardi.

**Lenta oralig'i konteynerdagi `gap` emas, har logodagi `mr`.** `gap` bilan
lentaning eni `2×logolar + 19×oraliq` bo'ladi, ya'ni `translateX(-50%)` yarim
oraliqqa (24px) kam siljiydi va halqa har aylanishda ko'zga tashlanadigan
sakrash bilan yopiladi. `mr` bilan eni `2×logolar + 20×oraliq` — `-50%` aniq
mos tushadi (o'lchandi: chok xatosi 24px → 0).

**Animatsiyani mobilda o'chirmang** — bir marta o'chirilgan va mijoz darrov
"logolar qotib qoldi" dedi. Telefonda logolar yo'qolib turgani uchun animatsiya
ayblangan edi, lekin haqiqiy sabab yuklanmagan rasmlar bo'lib chiqdi (yuqoridagi
`loading="lazy"` tuzog'i): tasodifan yuklangan bir-ikkitasi aylanib o'tar, lenta
qolgan vaqt bo'sh turardi — bu "bir necha soniya bor, bir necha soniya yo'q"
bo'lib ko'rinadi va kompozitsiya muammosiga juda o'xshaydi. Logo lentasidagi
har qanday "yo'qolish" shikoyatida **avval rasmlar yuklanganini tekshiring**
(`[...document.querySelectorAll('.sado-marquee img')].filter(i=>i.naturalWidth>0).length`),
keyingina qatlamlarga o'ting.

Shu bilan birga `--logo-filter` ning sukut qiymati
`invert(0)` emas, **`none`** — `invert(0)` piksellarni o'zgartirmasa ham har bir logoga
alohida kompozitsiya qatlami yasaydi, ya'ni yigirmata rasmga yigirmata qatlam. Yangi
filtr qo'shsangiz ham shu qoida: ishlatilmayotganda `none` bo'lsin, `…(0)` emas.

**Motion.** `components/motion/Reveal.tsx` — `Reveal` (skrollda ochiladi), `Stagger` +
`StaggerItem` (to'r bolalari ketma-ket), `Rise` (sahifa ochilishida, hero uchun). Hammasi
`once: true` va `prefers-reduced-motion` da butunlay o'chadi.

Client komponent, lekin `children` server komponentlardan uzatiladi — sahifalar server
bo'lib qoladi. Har biri `data-motion` belgisini oladi: SSR'da ular `opacity:0` bilan
chiqadi, shuning uchun `layout.tsx` dagi `<noscript>` ularni ko'rinadigan qiladi (JS
yuklanmasa sahifa bo'sh ko'rinardi).

Marquee, `.btn-fill` va `.nav-flip` **CSS'da qoladi** — ularni JS'ga ko'chirish bundle'ni
og'irlashtiradi, foyda bermaydi. Hero esa aksincha JS'ga o'tdi (`HeroSlideshow`): rasm soni
paneldan kelib o'zgargani uchun qat'iy N-kadrli CSS loop yaramaydi.

**Umumiy util klasslar** (`globals.css`, komponent emas):
- `.btn-fill` — tugma hover'da chapdan o'ngga to'ladigan fill animatsiya. `RedDotLink` va formadagi submit shuni ishlatadi.
- `.prose-oker` — blog maqola matni uchun long-form stillar.
- `.sado-marquee` — mijozlar logo qatori; `.sado-rail` — otzivlar qatori (sekinroq, hover'da to'xtaydi).
- `.shell` / `.bleed` — sahifa gutteri va undan chetga chiqish, `--gutter` va `--content` orqali.

**Interaktiv komponentlar `"use client"`.** `Header` (tema+til+to'liq ekranli mobil menyu, aloqa Sozlamalardan `settings` prop orqali), `ContactForm`, `Select` (native `<select>` o'rniga dizayn tizimiga mos custom dropdown), `Stats` (IntersectionObserver bilan count-up). Qolganlari server komponent.

**Contact form.** `ContactForm` (client, zod validatsiya) → `POST /api/contact` (`lib/contact.ts` dagi bir xil `contactSchema` bilan qayta tekshiradi). Route so'rovni `submissions` kolleksiyasiga yozadi va panelning bosh ekranida
(`/panel`) ro'yxat bo'lib chiqadi — xabarnoma (email/Telegram) hali TODO.
`submissions` da **barcha `access` yopiq**: bu yerda odamlarning telefon
raqamlari turadi va REST API ularni aks holda `/api/submissions` da ochib
qo'yardi. Forma Local API orqali yozadi, panel esa `requireUser()` ortidan
o'qiydi — ikkalasi ham access'dan o'tmaydi. Forma uch joyda: bosh sahifa CTA, `/services` va `/about#aloqa`. Alohida `/contact` sahifasi yo'q — `app/(site)/contact/route.ts` eski havolalarni `/about#aloqa` ga yo'naltiradi.

## Til / konvensiyalar

- UI matni va commit tavsiflari **o'zbekcha**.
- Strict TypeScript, `any` yo'q. Import alias: `@/*` → repo ildizi.
- **Bo'shliqlar:** seksiyalar orasidagi vertikal ritm — yuqoridagi `--spacing-*`
  tokenlari (`pt-section`, `mt-stack`, `p-card`). Komponent ichidagi mayda
  oraliqlar esa aniq piksel bilan: `gap-[16px]`, `mt-[8px]`.
- `public/images/` da SVG placeholder'lar ham, real fotolar ham bor (jpg/webp).
  Loyiha muqovalari va jamoa suratlari real, blog muqovalari hali SVG.

**Placeholder matn hali saytda ko'rinadi.** `data/*.ts` va `content/blog/*.mdx`
dagi bir qism matn "Placeholder matn:" prefiksi bilan belgilangan va seed orqali
bazaga tushgan (hozir 6 ta loyihada). Uni yashiradigan `stripPlaceholder` degan
yordamchi **yo'q** — ilgari shunday deb yozilgan edi, lekin kodda topilmadi.
Ya'ni bu matn `/portfolio/<slug>` sahifalarida o'qiladi. Tuzatish yo'li —
paneldan haqiqiy matn kiritish, kodda filtr yozish emas.
