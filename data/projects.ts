export type ProjectCategory = "Branding" | "Web" | "UI/UX" | "Print";

export interface Project {
  slug: string;
  title: string;
  client: string;
  year: string;
  category: ProjectCategory;
  services: string[];
  cover: string; // public/ path
  /** Tile aspect in the grid: "square" | "portrait" | "landscape" */
  aspect: "square" | "portrait" | "landscape";
  featured?: boolean;
  brief: string;
  solution: string;
  results?: { label: string; value: string }[];
  gallery: string[];
}

/**
 * Yangi loyiha qo'shish: shu massivga bitta obyekt qo'shing.
 * Rasmlarni public/images/projects/ ichiga joylang.
 */
export const projects: Project[] = [
  {
    slug: "orzu-bank",
    title: "Orzu Bank — raqamli brend",
    client: "Orzu Bank",
    year: "2025",
    category: "Branding",
    services: ["Brend strategiyasi", "Vizual identifikatsiya", "Dizayn tizimi"],
    cover: "/images/projects/orzu-cover.svg",
    aspect: "landscape",
    featured: true,
    brief:
      "Orzu Bank yosh auditoriyaga mo'ljallangan raqamli bank sifatida bozorga chiqmoqchi edi — ammo mavjud vizual til an'anaviy bank obrazidan farq qilmasdi. Placeholder matn: muammo tavsifi shu yerda.",
    solution:
      "Biz brendni noldan qayta qurdik: yangi logotip, qat'iy monoxrom palitra va bitta signal rang asosidagi tizim. Placeholder matn: yechim tavsifi shu yerda.",
    results: [
      { label: "Brend tanilishi o'sishi", value: "+64%" },
      { label: "Ilova yuklab olishlari", value: "120K" },
      { label: "Loyiha muddati", value: "14 hafta" },
    ],
    gallery: [
      "/images/projects/orzu-1.svg",
      "/images/projects/orzu-2.svg",
      "/images/projects/orzu-3.svg",
    ],
  },
  {
    slug: "tandir-restoran",
    title: "Tandir — restoran identifikatsiyasi",
    client: "Tandir Group",
    year: "2025",
    category: "Branding",
    services: ["Logotip", "Menyu dizayni", "Interyer grafikasi"],
    cover: "/images/projects/tandir-cover.svg",
    aspect: "square",
    featured: true,
    brief:
      "Placeholder matn: milliy oshxona tarmog'i uchun zamonaviy, lekin ildizlarga sodiq identifikatsiya kerak edi.",
    solution:
      "Placeholder matn: an'anaviy naqsh motivlarini minimal geometrik tizimga aylantirdik.",
    results: [
      { label: "Yangi filiallar", value: "8" },
      { label: "Ijtimoiy tarmoq o'sishi", value: "+180%" },
    ],
    gallery: ["/images/projects/tandir-1.svg", "/images/projects/tandir-2.svg"],
  },
  {
    slug: "yol-logistika",
    title: "Yo'l — logistika platformasi",
    client: "Yo'l Logistics",
    year: "2024",
    category: "UI/UX",
    services: ["UX tadqiqot", "Interfeys dizayni", "Prototiplash"],
    cover: "/images/projects/yol-cover.svg",
    aspect: "portrait",
    featured: true,
    brief:
      "Placeholder matn: haydovchilar va dispetcherlar uchun murakkab jarayonlarni soddalashtirish talab qilingan.",
    solution:
      "Placeholder matn: 40 dan ortiq ekranli dizayn tizimi va mobil ilova interfeysini loyihaladik.",
    results: [
      { label: "Buyurtma vaqti qisqarishi", value: "-38%" },
      { label: "Foydalanuvchi qoniqishi", value: "4.8/5" },
    ],
    gallery: ["/images/projects/yol-1.svg", "/images/projects/yol-2.svg"],
  },
  {
    slug: "sahro-fashion",
    title: "Sahro — moda brendi veb-sayti",
    client: "Sahro",
    year: "2024",
    category: "Web",
    services: ["Art-direksiya", "Veb-dizayn", "Frontend"],
    cover: "/images/projects/sahro-cover.svg",
    aspect: "landscape",
    featured: true,
    brief:
      "Placeholder matn: yangi kolleksiya uchun editorial uslubdagi onlayn vitrina kerak edi.",
    solution:
      "Placeholder matn: fotografiya birinchi o'ringa chiqqan, matn minimal bo'lgan sayt qurdik.",
    gallery: ["/images/projects/sahro-1.svg", "/images/projects/sahro-2.svg"],
  },
  {
    slug: "nashr-jurnal",
    title: "Nashr — jurnal maketi",
    client: "Nashr Media",
    year: "2023",
    category: "Print",
    services: ["Editorial dizayn", "Tipografika", "Bosma nazorati"],
    cover: "/images/projects/nashr-cover.svg",
    aspect: "portrait",
    brief:
      "Placeholder matn: har chorakda chiqadigan madaniyat jurnali uchun yangi maket tizimi.",
    solution:
      "Placeholder matn: modul to'r va ikki shriftli qat'iy tizim ishlab chiqdik.",
    gallery: ["/images/projects/nashr-1.svg"],
  },
  {
    slug: "quyosh-energiya",
    title: "Quyosh — korporativ sayt",
    client: "Quyosh Energy",
    year: "2023",
    category: "Web",
    services: ["Veb-dizayn", "Kontent strategiyasi"],
    cover: "/images/projects/quyosh-cover.svg",
    aspect: "square",
    brief:
      "Placeholder matn: qayta tiklanadigan energiya kompaniyasi uchun ishonch uyg'otuvchi sayt.",
    solution:
      "Placeholder matn: ma'lumotlarga asoslangan, sokin va aniq raqamli tajriba yaratdik.",
    gallery: ["/images/projects/quyosh-1.svg"],
  },
];

export const projectCategories: ProjectCategory[] = [
  "Branding",
  "Web",
  "UI/UX",
  "Print",
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function adjacentProjects(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? projects[i - 1] : projects[projects.length - 1],
    next: i < projects.length - 1 ? projects[i + 1] : projects[0],
  };
}
