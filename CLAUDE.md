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
bun test                # lexical round-trip guard
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
- `lib/content.ts` — `getProjects`, `getProject`, `adjacentProjects`, `getServices`
- `lib/blog.ts` — `getAllPosts`, `getPost`, `getBlogCategories`, `getRelatedPosts`

Bu funksiyalar Payload hujjatlarini `data/projects.ts` / `data/services.ts` dagi **tiplarga**
o'giradi, shuning uchun komponentlar o'zgarmadi. O'sha fayllardagi massivlar va
`content/blog/*.mdx` endi faqat `scripts/seed.ts` uchun — ularni tahrirlash saytni o'zgartirmaydi.

Maqola matni Payload'da Lexical formatida. `panel/lexical.ts` uni markdown bilan ikki tomonga
o'giradi: panelda `BlockEditor`, saytda `toText` → `MDXRemote`. `panel/lexical.test.ts` shu
o'girmani qo'riqlaydi — **o'chirmang**, undagi drift mijozning yozganini yo'qotadi.

**Panel** (`/panel`). Ekranlar qo'lda yozilgan, sxemadan generatsiya qilinmagan: `panel/` —
toolkit (`ui.tsx`, `ItemList`, `MediaPicker`, `BlockEditor`, `auth.ts`), `app/panel/(app)/` —
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

**Lokalizatsiya o'chirilgan.** Header'dagi til tanlagich hozircha faqat `<html lang>` ni
almashtiradi. Yoqish = `payload.config.ts` ga `localization` bloki, maydonlarga `localized: true`,
formalarga `LangTabs` (`panel/ui.tsx` da tayyor) va massivli maydonlar uchun `saveLocalized`
(o'chirilgan — Payload massiv qatorlaridagi tarjimalarni qator id'siz yozsang jimgina yo'qotadi).

**Rang tizimi — token orqali, hech qachon hardcode qilinmaydi.** Barcha ranglar `app/(site)/globals.css` `@theme` blokidagi CSS o'zgaruvchilar (`--color-pure-black` = fon, `--color-bone-white` = matn, `--color-fog-gray` = ikkinchi matn, `--color-graphite` = chiziq, `--color-soft-black` = ikkinchi fon, `--color-scarlet-signal` = yagona aksent). Tailwind bularni `bg-pure-black`, `text-fog-gray` kabi util sifatida taniydi.

- Token nomlari tarixiy (dark-first) lekin qiymatlari **semantik** — light modeda `bone-white` qora bo'ladi. Yangi komponentda hardcoded hex yoki `bg-white`/`text-black` ishlatmang, aks holda light mode buziladi.
- **Light/dark mode:** header'dagi toggle `<html data-theme>` ni o'zgartiradi va `localStorage.theme` ga saqlaydi; `app/(site)/layout.tsx` inline skripti FOUC oldini olish uchun birinchi bo'yashdan oldin qo'llaydi. `data-theme` tizim sozlamasidan (`prefers-color-scheme`) ustun turadi.

**Tipografika.** `Inter Tight` (`next/font`, `--font-sans` o'zgaruvchisi orqali `app/layout.tsx` da). Sarlavha darajalari `.display` (hero/CTA) va `.heading` (seksiyalar) — `globals.css` da `clamp()` bilan. Seksiya oʻlchamlari `text-subheading`/`text-heading-sm` tokenlarda.

**Seksiya naqshi.** Bosh sahifa seksiyalari izchil ritmda: `pt-[80px]`/`pt-[160px]`, hairline `border-t border-graphite` + kulrang kicker (`SectionHeading` komponenti buni inkassa qiladi).

**Umumiy util klasslar** (`globals.css`, komponent emas):
- `.btn-fill` — tugma hover'da chapdan o'ngga to'ladigan fill animatsiya. `RedDotLink` va formadagi submit shuni ishlatadi.
- `.hero-frame` + `hero-loop` — hero'dagi 5 ta rasm (`public/sd1–sd5`) 0.5s CSS loop bilan almashadi.
- `.prose-oker` — blog maqola matni uchun long-form stillar.
- `.sado-marquee` — mijozlar logo qatori.

**Interaktiv komponentlar `"use client"`.** `Header` (toggle+soat+menyu), `ContactForm`, `Select` (native `<select>` o'rniga dizayn tizimiga mos custom dropdown), `Stats` (IntersectionObserver bilan count-up). Qolganlari server komponent.

**Contact form.** `ContactForm` (client, zod validatsiya) → `POST /api/contact` (`lib/contact.ts` dagi bir xil `contactSchema` bilan qayta tekshiradi). Route hozircha faqat `console.log` qiladi — email integratsiyasi TODO. Forma ikki joyda: bosh sahifa CTA va `/contact`.

## Til / konvensiyalar

- UI matni va commit tavsiflari **o'zbekcha**. Placeholder kontent "Placeholder matn:" prefiksi bilan belgilangan; UI da `stripPlaceholder`/regex bilan yashiriladi.
- Strict TypeScript, `any` yo'q. Import alias: `@/*` → repo ildizi.
- Bo'shliqlar Tailwind da aniq piksel bilan: `gap-[16px]`, `pt-[160px]` (tema spacing tokenlari emas).
- Placeholder rasmlar `public/images/` da SVG — real fotolar bilan almashtiriladi.
