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

Verifikatsiya = `bunx tsc --noEmit` + `bun test` + brauzerda ko'zdan kechirish. Seed va dev
server bir vaqtda ishlamaydi — ikkalasi ham SQLite sxemasini push qiladi va bir-birini kutib qoladi.

## Arxitektura

**Ikkita root layout.** `app/(site)/` — publik sayt (Header/Footer/globals.css), `app/panel/` —
CMS paneli (o'z `<html>`, `panel.css`). Ular alohida root bo'lgani uchun mos kelmagan URL'lar
`app/global-not-found.tsx` orqali sayt 404'ini qaytaradi — Next'ning zavod 404'i emas.

**Kontent Payload'da.** `collections/*.ts` sxema, `payload.config.ts` konfiguratsiya, baza —
`db.sqlite` (`DATABASE_URI`). Sayt uni faqat ikki modul orqali o'qiydi:
- `lib/content.ts` — `getProjects`, `getProject`, `adjacentProjects`, `getServices`,
  `getTestimonials`
- `lib/blog.ts` — `getAllPosts`, `getPost`, `getBlogCategories`, `getRelatedPosts`

Bu funksiyalar Payload hujjatlarini `data/projects.ts` / `data/services.ts` dagi **tiplarga**
o'giradi, shuning uchun komponentlar o'zgarmadi. O'sha fayllardagi massivlar va
`content/blog/*.mdx` endi faqat `scripts/seed.ts` uchun — ularni tahrirlash saytni o'zgartirmaydi.

Istisno — **`getTestimonials` da zaxira bor**: jadval bo'sh bo'lsa
`data/testimonials.ts` dagi otzivlar chiqadi. Sabab `db-ensure`: u yangi
jadvalni bo'sh yaratadi, ya'ni bu kolleksiya qo'shilgan deploy'dan keyin prod
bazasida bitta ham otziv bo'lmasdi va ishonch bandi mijozning haqiqiy
otzivlarisiz chiqardi. Yon ta'siri: oxirgi otzivni o'chirish kodagilarni
qaytaradi. Mijoz logolari (`clients`) va jamoa (`team`, `values`) hali ham
faqat kodda.

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

**Panel** (`/panel`). Ekranlar qo'lda yozilgan, sxemadan generatsiya qilinmagan: `panel/` —
toolkit (`ui.tsx`, `ItemList`, `ImageDrop`, `BlockEditor`, `auth.ts`), `app/panel/(app)/` —
ekranlar. Kolleksiya qo'shish = 4 ta fayl (`<x>-data.ts`, `<x>-actions.ts`, `<X>Form.tsx`,
`app/panel/(app)/<nom>/`) + `Nav.tsx` da bitta qator. Har bir server action `requireUser()` bilan
boshlanadi — action o'z HTTP kirish nuqtasi, layout'ning qorovuli uni qamramaydi.

Rasmlar **forma ichida** yuklanadi: `panel/ImageDrop.tsx` (`ImageDrop` — bitta rasm,
`ImageStack` — galereya) va `BlockEditor` fayllarni `POST /api/panel/upload` ga `fetch`
bilan yuboradi. Forma yuborilmaydi, sahifa qayta yuklanmaydi, yozilgan matn yo'qolmaydi —
shuning uchun bu server action emas, route handler. Sudrab tashlash, Cmd+V va tanlash
uchtasi ham ishlaydi; `/panel/rasmlar` esa umumiy kutubxona sifatida qoladi.

Alt matni yuklashda so'ralmaydi (oqimni to'xtatadi) — fayl nomidan qo'yiladi va rasm
ostida tahrirlanadi (`PATCH /api/panel/upload`). Fayllar `media/` da,
`/api/media/file/<nom>` orqali uzatiladi (`app/(payload)/api/[...slug]`).

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
sahifaning birinchi ekrani (matn + `heroImages`), aloqa ma'lumotlari, ishonch bandidagi
`stats` raqamlari, ijtimoiy tarmoqlar, meta tavsif. Sayt uni `lib/getSettings()` orqali
o'qiydi va har bir maydon uchun zaxira bor — `data/site.ts`, raqamlar uchun `data/team.ts`
dagi `stats`, hero rasmlari uchun `public/sd1–sd5`. Sayt nomi, manzili
va navigatsiya tuzilishi kodda qoladi — ular kontent emas. Hero'ni `HeroSlideshow` (client,
JS crossfade) render qiladi — rasm soni paneldan kelgani uchun har qanday songa moslashadi.

`stats` va `socials` — o'zgaruvchan sonli qatorlar. Formada ikkalasini ham
`SettingsForm.tsx` dagi `RepeatRows` chizadi va u qatorni **indeks bilan emas,
o'sib boradigan kalit bilan** belgilaydi: `Field` boshqarilmaydigan input
ustiga qurilgan, indeks bilan kalitlanganda o'rtadagi qator o'chirilsa React
DOM tugunini qayta ishlatardi va ekranda o'chirilgan qatorning matni qolib
ketardi. `settings-actions.ts` esa `<prefix>.<i>.<field>` kalitlarini o'qiydi
va faqat to'liq to'ldirilgan qatorni saqlaydi.

**`Stats` — client komponent va qiymatni prop orqali oladi.** `lib/settings.ts`
dan **qiymat** import qilib bo'lmaydi (u Payload'ni tortadi va build yiqiladi) —
sahifa server tomonda o'qiydi, komponentga tayyor massiv keladi.

**Rasm = LCP. Ikki qoida buzilmasin.** Sayt rasmlari `next/image` orqali ketadi (istisno:
mijoz logolari — o'nlab turli nisbatda, ular tayyor 224px WebP va `loading="lazy"`).
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

**Deploy (Coolify, Docker).** `Dockerfile` — bun install → `next build` (SSG sxemani
o'qish uchun `cp schema.sqlite db.sqlite`; SIGTRAP-on-exit `.next/BUILD_ID` bilan ajratiladi)
→ `docker-entrypoint.sh`. Prodda Payload sxema push qilmaydi va uni konteynerda Next'dan
tashqarida ishga tushirib bo'lmaydi (bun ostida payload CLI/tsx va lexical yiqiladi), shuning
uchun **sxema `schema.sqlite`** — sxema-only, 0 qatorli SQLite repoda commit qilingan.
`scripts/db-ensure.ts` (bun:sqlite, payload'siz) entrypoint'da: bo'sh volume'ga sxemani
ko'chiradi; sxemada bor jadval bazada yo'q bo'lsa (yangi kolleksiya) o'sha jadvalning
CREATE'ini bajaradi — mavjud jadvallarga tegmaydi, ya'ni kontent ham, foydalanuvchilar ham
joyida qoladi (`scripts/db-ensure.test.ts` shuni qo'riqlaydi). **Kolleksiya/global
o'zgarsa:** `bunx payload generate:types` (payload-types.ts, u ham commit qilinadi) +
`schema.sqlite` ni qayta yarat
(`rm schema.sqlite && NODE_ENV=development DATABASE_URI=file:./schema.sqlite bun scripts/db-init.ts`).
Aniqlanmaydigan yagona narsa — **mavjud jadvaldagi ustun o'zgarishi** (maydon qo'shildi yoki
nomi o'zgardi); u prodda qo'lda ALTER talab qiladi. Baza `/app/data`, rasmlar `/app/media` — Coolify volume'lari. Repoga push
= avtodeploy (GitHub App webhook).

**Lokalizatsiya o'chirilgan.** Header'dagi til tanlagich hozircha faqat `<html lang>` ni
almashtiradi. Yoqish = `payload.config.ts` ga `localization` bloki, maydonlarga `localized: true`,
formalarga `LangTabs` (`panel/ui.tsx` da tayyor) va massivli maydonlar uchun `saveLocalized`
(o'chirilgan — Payload massiv qatorlaridagi tarjimalarni qator id'siz yozsang jimgina yo'qotadi).

**Rang tizimi — token orqali, hech qachon hardcode qilinmaydi.** Barcha ranglar `app/(site)/globals.css` `@theme` blokidagi CSS o'zgaruvchilar (`--color-pure-black` = fon, `--color-bone-white` = matn, `--color-fog-gray` = ikkinchi matn, `--color-graphite` = chiziq, `--color-soft-black` = ikkinchi fon, `--color-scarlet-signal` = yagona aksent). Tailwind bularni `bg-pure-black`, `text-fog-gray` kabi util sifatida taniydi.

- Token nomlari tarixiy (dark-first) lekin qiymatlari **semantik** — light modeda `bone-white` qora bo'ladi. Yangi komponentda hardcoded hex yoki `bg-white`/`text-black` ishlatmang, aks holda light mode buziladi.
- **Light/dark mode:** header'dagi toggle `<html data-theme>` ni o'zgartiradi va `localStorage.theme` ga saqlaydi; `app/(site)/layout.tsx` inline skripti FOUC oldini olish uchun birinchi bo'yashdan oldin qo'llaydi. `data-theme` tizim sozlamasidan (`prefers-color-scheme`) ustun turadi.

**Tipografika.** `Inter Tight` (`next/font`, `--font-sans` o'zgaruvchisi orqali `app/(site)/layout.tsx` da). Sarlavha darajalari `.display` (hero/CTA) va `.heading` (seksiyalar) — `globals.css` da `clamp()` bilan. Seksiya oʻlchamlari `text-subheading`/`text-heading-sm` tokenlarda.

**Seksiya naqshi.** Bosh sahifa seksiyalari izchil ritmda, hairline `border-t border-graphite` + kulrang kicker (`SectionHeading` komponenti buni inkassa qiladi).

**Vertikal ritm — token orqali, `pt-[160px]` deb yozmang.** `globals.css` `@theme` da
`--spacing-section-lg` / `-section` / `-section-sm` / `-block` / `-card`, ya'ni
`pt-section`, `mt-block`, `p-card`. Ular 768px dan pastda kichrayadi (240→88, 160→72,
120→56, 64→40, 32→20). Ilgari har bir seksiya o'z qiymatini qo'lda olib yurardi va
mobilda qisqarmasdi: 375px ekranda bosh sahifa 11 ekranga cho'zilardi. **Yangi mobil
qiymat qo'shganda `md:` dan foydalaning, `lg:` dan emas** — desktop chegarasi 768px, va
`lg:` bilan yozilgan tuzatish 768–1023px oralig'ida qo'llanmay qoladi.

**Mobilda barmoq uchun 44px.** Matn havolasiga `.tap` klassi vertikal padding beradi
(faqat <768px). Salbiy margin ataylab yo'q: u qo'shni havolalarning bosish maydonlarini
ustma-ust tushirardi — o'rniga konteynerdagi `gap` kichraytiriladi.

**Otzivlar qatori mobilda marquee emas.** `.sado-rail` animatsiyasi va
`.sado-rail-mask` `@media (min-width: 768px)` ichida. Telefonda `hover` yo'q, ya'ni
suzib ketayotgan otzivni to'xtatib o'qib bo'lmasdi; u yerda `overflow-x-auto snap-x`
qoladi, karta `w-[85vw]` (keyingisining cheti ko'rinib turadi — surish ishorasi), va
takror `<li>` lar `max-md:hidden` — aks holda swipe uzunligi ikki baravar bo'lardi.

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

- UI matni va commit tavsiflari **o'zbekcha**. Placeholder kontent "Placeholder matn:" prefiksi bilan belgilangan; UI da `stripPlaceholder`/regex bilan yashiriladi.
- Strict TypeScript, `any` yo'q. Import alias: `@/*` → repo ildizi.
- Bo'shliqlar Tailwind da aniq piksel bilan: `gap-[16px]`, `pt-[160px]` (tema spacing tokenlari emas).
- Placeholder rasmlar `public/images/` da SVG — real fotolar bilan almashtiriladi.
