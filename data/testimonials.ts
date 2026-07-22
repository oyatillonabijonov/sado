export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Placeholder matn: SADO bizning brendimizni biz o'zimiz tushunmagan darajada tushundi. Natija — bozorda butunlay yangi pozitsiya.",
    name: "Dilshod Ergashev",
    role: "Bosh direktor",
    company: "Orzu Bank",
  },
  {
    quote:
      "Placeholder matn: jarayon boshidan oxirigacha aniq edi. Har bir bosqichda nima uchun shu qaror qabul qilinganini bilardik.",
    name: "Kamola Saidova",
    role: "Marketing rahbari",
    company: "Sahro",
  },
  {
    quote:
      "Placeholder matn: ilovamizning yangi interfeysi chiqqach, foydalanuvchi shikoyatlari deyarli yo'qoldi.",
    name: "Bekzod Nurmatov",
    role: "Mahsulot menejeri",
    company: "Yo'l Logistics",
  },
];

export interface Client {
  name: string;
  logo: string;
}

export const clients: Client[] = [
  { name: "AIFU", logo: "/images/clients/aifu.png" },
  { name: "Yetakchilar Akademiyasi", logo: "/images/clients/yetakchilar.png" },
  { name: "Melek", logo: "/images/clients/melek.png" },
  { name: "AllSolar", logo: "/images/clients/allsolar.png" },
  { name: "Kiias", logo: "/images/clients/kiias.png" },
  { name: "Oxus University", logo: "/images/clients/oxus.png" },
  { name: "Andy's Kitchen", logo: "/images/clients/andys.png" },
  { name: "Arbol", logo: "/images/clients/arbol.png" },
  { name: "Mohir", logo: "/images/clients/mohir.png" },
  { name: "Ansor", logo: "/images/clients/ansor.png" },
];

export const processSteps = [
  {
    n: "01",
    title: "Tanishuv (Discovery)",
    text: "Placeholder matn: biznesingiz, auditoriyangiz va raqobat muhitini o'rganamiz. Savollar beramiz, taxminlarni tekshiramiz.",
  },
  {
    n: "02",
    title: "Strategiya",
    text: "Placeholder matn: tadqiqot xulosalarini yo'nalishga aylantiramiz — pozitsiyalash, xabarlar, dizayn tamoyillari.",
  },
  {
    n: "03",
    title: "Dizayn",
    text: "Placeholder matn: konsepsiyadan tizimgacha. Har bir bosqichda siz bilan ko'rib chiqamiz va sinovdan o'tkazamiz.",
  },
  {
    n: "04",
    title: "Ishlab chiqish",
    text: "Placeholder matn: dizaynni kodga, bosmaga yoki animatsiyaga aylantiramiz — sifat nazorati bilan.",
  },
  {
    n: "05",
    title: "Topshirish",
    text: "Placeholder matn: qo'llanmalar, fayllar va jamoangizni o'qitish. Kerak bo'lsa, doimiy hamkorlikda qolamiz.",
  },
];
