/**
 * ponytail: bu massiv endi SAYTGA emas, faqat `scripts/seed.ts` ga xizmat qiladi —
 * kontent Payload'da (`collections/Services.ts`), sayt uni `lib/content.ts` orqali o'qiydi.
 * Bu yerni tahrirlash saytni o'zgartirmaydi; /panel/xizmatlar dan foydalaning.
 */
export interface Service {
  slug: string;
  title: string;
  description: string;
  deliverables: string[];
  fitFor: string;
}

export const services: Service[] = [
  {
    slug: "brend-strategiyasi",
    title: "Brend strategiyasi",
    description:
      "Placeholder matn: brendingiz nima uchun mavjudligini, kim bilan gaplashishini va qanday ovozda gapirishini aniqlaymiz.",
    deliverables: [
      "Bozor va auditoriya tadqiqoti",
      "Pozitsiyalash va qadriyatlar",
      "Brend ovozi va xabarlar tizimi",
      "Nomlash (naming)",
    ],
    fitFor:
      "Yangi bozorga chiqayotgan yoki qayta pozitsiyalanayotgan kompaniyalarga mos.",
  },
  {
    slug: "brend-dizayn",
    title: "Brend dizayn",
    description:
      "Placeholder matn: strategiyani ko'rinadigan tizimga aylantiramiz — logotipdan to'liq vizual tilgacha.",
    deliverables: [
      "Logotip va belgilar tizimi",
      "Rang va tipografika tizimi",
      "Brend qo'llanmasi (guidelines)",
      "Korporativ materiallar",
    ],
    fitFor: "Identifikatsiyasi eskirgan yoki tarqoq brendlarga mos.",
  },
  {
    slug: "veb-dizayn",
    title: "Veb-dizayn va ishlab chiqish",
    description:
      "Placeholder matn: brendingizni raqamli muhitda yashaydigan, tez va aniq saytlarga aylantiramiz.",
    deliverables: [
      "Sayt arxitekturasi va wireframe",
      "Vizual dizayn va prototip",
      "Frontend ishlab chiqish (Next.js)",
      "CMS integratsiyasi",
    ],
    fitFor:
      "Sayti savdo yoki ishonch keltirmayotgan har qanday biznesga mos.",
  },
  {
    slug: "ui-ux",
    title: "UI/UX dizayn",
    description:
      "Placeholder matn: mahsulot interfeyslarini foydalanuvchi tadqiqotiga asoslanib loyihalaymiz.",
    deliverables: [
      "UX tadqiqot va intervyular",
      "Foydalanuvchi oqimlari (user flows)",
      "Interfeys dizayni va dizayn tizimi",
      "Yuzabilite testlari",
    ],
    fitFor: "Ilova yoki platforma quruvchi mahsulot jamoalariga mos.",
  },
  {
    slug: "motion-dizayn",
    title: "Motion dizayn",
    description:
      "Placeholder matn: brendni harakatda ochib beramiz — logo animatsiyasidan mahsulot videolarigacha.",
    deliverables: [
      "Logo va brend animatsiyasi",
      "Ijtimoiy tarmoq videolari",
      "Mahsulot taqdimot roliklari",
    ],
    fitFor: "Raqamli kanallarda faol brendlarga mos.",
  },
  {
    slug: "print-dizayn",
    title: "Print va editorial",
    description:
      "Placeholder matn: bosma materiallar — jurnal, katalog, qadoq — uchun tipografik tizimlar quramiz.",
    deliverables: [
      "Editorial maket tizimlari",
      "Katalog va hisobot dizayni",
      "Qadoq dizayni",
      "Bosmaxona nazorati",
    ],
    fitFor: "Nashriyotlar va jismoniy mahsulot brendlariga mos.",
  },
];
