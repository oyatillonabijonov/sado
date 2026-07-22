# SADO — Dizayn agentligi sayti

Next.js (App Router) + Tailwind CSS v4. Studio Oker dizayn tizimi asosida:
qora kanva, 0px radius, NextBook (300/400), bitta scarlet aksent.

## Ishga tushirish

```bash
npm install
npm run dev
```

## Struktura

- `app/` — sahifalar (App Router), API route, sitemap, robots
- `components/` — UI komponentlar
- `data/` — kontent data layer (loyihalar, xizmatlar, jamoa, testimonial)
- `content/blog/` — MDX maqolalar (frontmatter: title, description, date, category, cover, author)
- `lib/` — blog o'qish, contact validatsiya (zod, client + server)
- `public/images/` — placeholder rasmlar (SVG) — real fotolar bilan almashtiring

## Yangi kontent qo'shish

- **Loyiha:** `data/projects.ts` massiviga bitta obyekt qo'shing
- **Maqola:** `content/blog/` ichiga bitta `.mdx` fayl qo'shing
- **Xizmat / jamoa a'zosi:** `data/services.ts` / `data/team.ts`

## Font

`NextBook` — studiyaning shaxsiy shrifti. Litsenziyalangan fayllarni
`public/fonts/` ga joylab, `app/globals.css` da `@font-face` qo'shing.
Bepul muqobil: Söhne uslubidagi humanist-geometrik sans.

## Contact form

`app/api/contact/route.ts` hozircha `console.log` qiladi — email
integratsiyasi (Resend/Nodemailer) uchun TODO belgilangan.
