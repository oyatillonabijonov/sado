# Mobile-first qayta dizayn — SADO sayti

**Sana:** 2026-08-09
**Holat:** tasdiqlangan, bajarilmoqda

## Muammo

Sayt mobilda "shunchaki responsive": desktop uchun yozilgan tartib tor ekranga
siqilgan, lekin telefon uchun hech narsa qayta o'ylanmagan. O'lchangan holat
(375×812, dev server):

- Bosh sahifa **9346px** — 11.5 ekran. Footer bitta o'zi 1363px.
- ~20 ta qotgan bo'shliq (`pt-[160px]`, `mt-[240px]`, `py-[120px]`) mobilda
  qisqarmaydi. Seksiya sarlavhasidan birinchi kartagacha ~500px.
- Otzivlar kartasi 360px, ekran 375px — chetdan chiqib ketgan. Qator o'zi
  suriladi va faqat `hover` da to'xtaydi; telefonda `hover` yo'q, ya'ni matnni
  **to'xtatib o'qib bo'lmaydi**.
- Tap-target'lar: menyu tugmasi 29×29, tema 34×34, newsletter o'qi 16×26,
  footer havolalari 26px. Minimum 44px.
- Til tanlagich mobilda umuman yo'q (`hidden md:block`).
- Stats mobilda 1 ustun — 4 ta 40px raqam ustma-ust.
- Blog maqola muqovasi `21/9` → mobilda 375×160 tasma.
- Portfolio/blog filtrlari `flex-wrap` → uch qator.

## Qaror

**Persona:** telefondan kelgan odam SADO haqida eshitgan va "jiddiy agentlikmi?"
deb tekshiradi. Shuning uchun mobilda ishonch dalillari (mijozlar, raqamlar,
otzivlar) yuqoriga chiqadi.

**Desktop tegilmaydi.** Bugungi desktop dizayn regressiya ko'rmasligi kerak.

## Yondashuv: CSS divergensiya

Bitta komponent daraxti. Tailwind bazasi = mobil, `md:` = bugungi desktop
qiymatlari. Seksiya tartibi flex `order` bilan almashadi va `md:` da qaytadi.
Mobil-only bloklar `md:hidden`.

Rad etilgan variantlar:

- **Alohida `<MobileHome/>`** — markup ikki baravar, va CLAUDE.md dagi ma'lum
  tuzoq qaytadi: yashirilgan rasmni brauzer baribir yuklaydi.
- **`useMediaQuery` bilan JS** — hydration mismatch, server komponentlar
  client'ga aylanadi, birinchi bo'yashda sakrash.

## O'zgarishlar

### 1. Bo'shliq ritmi — ildiz sabab

`globals.css` `@theme` ga uchta token, 768px da media-query bilan qayta
belgilanadi:

| Token | Mobil | `md:` |
|---|---|---|
| `--spacing-section` | 72px | 160px |
| `--spacing-block` | 40px | 64px |
| `--spacing-card` | 20px | 32px |

`pt-[160px]` → `pt-section`. Tailwind `padding-top: var(--spacing-section)`
chiqargani uchun media-query ish paytida qo'llanadi — bitta joyda ritm butun
sayt bo'ylab hal bo'ladi.

### 2. Bosh sahifa iyerarxiyasi

`Hero → Mijozlar → Ishlar → Blog → Ishonch → CTA` — mobil va desktopda bir xil.

Ishonch bandi formadan bevosita oldin turadi: odam "bog'lanaymi?" degan
qarorni raqamlar va mijoz so'zlari hali ko'z oldida turganda qabul qiladi.

Birinchi variantda u mobilda tepaga (Mijozlardan keyin) chiqarilgan va tartib
CSS `order` bilan almashtirilgan edi; mijoz uni blog bilan forma orasiga
qo'yishni so'ragach manba tartibining o'zi shunga keldi va `order` klasslari
butunlay olib tashlandi.

### 3. Ishonch bandi

- **Stats:** har bir raqam alohida karta — `rounded-[10px] bg-pure-black
  p-card`, ya'ni otziv kartasi bilan bir xil fon va radius. Ilgari raqamlar
  bandning fonida yalang'och turardi va o'sha bandda kartalar bilan yonma-yon
  bo'lsa-da boshqa tilda gapirardi. Mobilda 2×2, desktopda 4 ta qator.
  Kontent tepaga tekislangan: `justify-between` bilan qisqa yorliq kartaning
  tagiga tushib, raqam bilan orasida bo'sh joy qolardi.
- `/about` da Stats soft-black panel ichida qoladi, lekin panel paddingi
  32/48 → 16/24 ga tushdi: kartaning o'z paddingi ustiga qo'shilib ikki qavat
  ramka berardi.
- **Otzivlar:** mobilda marquee o'chadi. Native `overflow-x-auto` +
  `snap-x snap-mandatory`, karta `w-[85vw]` — keyingi kartaning cheti ko'rinadi
  va surish mumkinligi o'z-o'zidan o'qiladi. Takror `<li>` lar `max-md:hidden`
  (aks holda swipe uzunligi ikki baravar).
- `sado-marquee-mask` mobilda qo'llanmaydi — surish rail'ida yeyilgan chetlar
  nuqson bo'lib ko'rinadi.

### 4. Header va menyu

- Menyu tugmasi va tema toggle 44×44.
- Menyu to'liq ekranli overlay: 32px havolalar, 56px qator, `body` scroll-lock.
- Til tanlagich mobilga qaytadi.
- Menyu tagida email/telefon — ishonch tekshirgan odam shu yerdan chiqadi.

### 5. Filtrlar

`/portfolio` chip'lari va `/blog` matn havolalari mobilda o'ralmaydi —
gorizontal suriladi, chetdan chetgacha (`-mx` + `px` = gutter), 44px target.

Umumiy `FilterRail` komponenti **qilinmadi**: ikkovining desktopdagi ko'rinishi
turlicha (chip va nuqtali matn), ularni birlashtirish desktop dizaynini
o'zgartirardi. Bitta umumiy klass qatori har ikkalasida — bu shu ikki chaqiruv
uchun komponentdan qisqaroq.

### 6. Footer

1363px → ~600px. Menyu/Ijtimoiy mobilda 2 ustun, Aloqa va Newsletter to'liq
kenglik. Havolalarga vertikal padding (26→44px). Newsletter o'qi 44×44.
Yuqori bo'shliq 240 → 72px.

### 7. Ichki sahifalar

| Sahifa | O'zgarish |
|---|---|
| `/blog/[slug]` | Muqova `4/3 md:21/9`; meta 2 ustun; `.prose-oker` h2 margini 56→40px |
| `/portfolio/[slug]` | Meta qatori 2 ustun; `mt-[120px]`×6 → token |
| `/about` | Jamoa to'ri mobilda 2 ustun; karta paddinglari token |
| `/services` | Karta padding token; ritm token |

### 8. Ataylab qilinmaydi

**Sticky pastki CTA paneli.** Persona kontentni o'qiydi, doimiy panel har
ekranda ~64px yeydi. Aloqa menyuda va CTA seksiyasida qoladi.

## Verifikatsiya

- `bunx tsc --noEmit` va `bun test`.
- 375 / 390 / 430px kengliklarda gorizontal overflow yo'qligi
  (`scrollWidth === clientWidth`).
- Barcha interaktiv element ≥44px (DOM sweep skripti).
- Light va dark rejimda ko'zdan kechirish.
- Desktop (1280px) skrinshotlari o'zgarmaganini tasdiqlash.

## Natija (o'lchangan, 375×812)

| | Oldin | Keyin |
|---|---|---|
| Bosh sahifa balandligi | 9346px | 7813px (−16%) |
| Ishonch bandi | 1461px | 963px |
| Footer | 1363px | 1066px |
| 44px dan kichik tap-target | 18 ta | 0 ta |
| Gorizontal overflow (375/430) | yo'q | yo'q |

Qisqarish 25–30% emas, 17% bo'ldi: qolgan balandlikning ko'pi bo'shliq emas,
kontentning o'zi (rasm + matn). Bo'shliqdan qirqiladigani qirqildi.
