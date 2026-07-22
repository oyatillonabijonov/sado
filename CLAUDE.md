# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

SADO — Toshkentdagi dizayn agentligi uchun marketing sayti. Next.js 15 (App Router) + React 19 + Tailwind CSS v4.

## Buyruqlar

Package manager: **bun** (`bun.lock` bor). `bun run dev` porti sifatida 3005 ishlatiladi (`.claude/launch.json`).

```bash
bun install
bun run dev        # dev server
bun run build      # productionga build
bunx tsc --noEmit  # type-check (test suite yo'q — o'zgarishlardan keyin shuni ishlating)
```

Test frameworki yo'q. Verifikatsiya = `bunx tsc --noEmit` + brauzerda ko'zdan kechirish.

## Arxitektura

**Kontent data layer.** Sayt kontenti kod ichida yashaydi, tashqi CMS yoki DB yo'q:
- `data/*.ts` — typed massivlar (`projects`, `services`, `team`/`stats`, `testimonials`/`clients`/`processSteps`, `site`). Yangi loyiha/xizmat = massivga bitta obyekt.
- `content/blog/*.mdx` — maqolalar. Frontmatter: `title, description, date, category, cover, author`. `lib/blog.ts` bularni `fs` orqali build vaqtida o'qiydi, `readingTime`ni avtomatik hisoblaydi, sanaga qarab saralaydi. Blog sahifalari `generateStaticParams` bilan statik.

**Rang tizimi — token orqali, hech qachon hardcode qilinmaydi.** Barcha ranglar `app/globals.css` `@theme` blokidagi CSS o'zgaruvchilar (`--color-pure-black` = fon, `--color-bone-white` = matn, `--color-fog-gray` = ikkinchi matn, `--color-graphite` = chiziq, `--color-soft-black` = ikkinchi fon, `--color-scarlet-signal` = yagona aksent). Tailwind bularni `bg-pure-black`, `text-fog-gray` kabi util sifatida taniydi.

- Token nomlari tarixiy (dark-first) lekin qiymatlari **semantik** — light modeda `bone-white` qora bo'ladi. Yangi komponentda hardcoded hex yoki `bg-white`/`text-black` ishlatmang, aks holda light mode buziladi.
- **Light/dark mode:** header'dagi toggle `<html data-theme>` ni o'zgartiradi va `localStorage.theme` ga saqlaydi; `app/layout.tsx` inline skripti FOUC oldini olish uchun birinchi bo'yashdan oldin qo'llaydi. `data-theme` tizim sozlamasidan (`prefers-color-scheme`) ustun turadi.

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
