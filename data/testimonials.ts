export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Boshlanishida men ishonmagan edim, o‘zimni vatanimdagi xodimlarga ish beramanmi degandim — lekin menga sizlarni tavsiya qilishdi. Sizlarni bizga bergan ishlaringiz juda yoqdi. Tanlangan nom va qilingan dizaynlar juda zo‘r. SADO brending ishlariga omad ⚡️",
    name: "Jahongir Shukurov",
    role: "Asoschi",
    company: "AllSolar",
  },
  {
    quote:
      "Rostini aytsam, avval bir necha joyga murojaat qilgandik va hech kim bizni tushunmadi. Sizlar birinchi uchrashuvdayoq savol berib, biznesimizni ichidan ko‘rdingiz. Qadoqlash chiqqanda sotuvchilarimiz o‘zi surat olib tarqata boshladi.",
    name: "Nodira Yo‘ldosheva",
    role: "Hammuassis",
    company: "HONUT",
  },
  {
    quote:
      "Eng yoqqani — har bir qadamda nima uchun aynan shunday qilinganini tushuntirib berdingiz. Biz “chiroyli bo‘libdi” deb emas, “to‘g‘ri bo‘libdi” deb qabul qildik. Jamoamiz endi brend qo‘llanmasidan har kuni foydalanadi.",
    name: "Kamola Saidova",
    role: "Marketing rahbari",
    company: "Sahro",
  },
  {
    quote:
      "Muddat bo‘yicha bir marta ham kechikmadingiz — bu bizda kamdan-kam uchraydi. Yangi interfeys chiqqach, qo‘llab-quvvatlash bo‘limiga tushayotgan savollar sezilarli kamaydi.",
    name: "Bekzod Nurmatov",
    role: "Mahsulot menejeri",
    company: "Yo‘l Logistics",
  },
  {
    quote:
      "Bizda logotip bor edi, lekin tizim yo‘q edi — har bir bo‘lim o‘zicha ishlardi. SADO shuni tartibga soldi. Endi yangi materialni ikki kunda emas, ikki soatda tayyorlaymiz.",
    name: "Dilshod Ergashev",
    role: "Bosh direktor",
    company: "Orzu Bank",
  },
  {
    quote:
      "Toshkentda bunday darajadagi editorial dizaynni kutmagandim. Jurnalimizning yangi maketi chiqqach, bosmaxona ham “kim qilgan buni” deb so‘radi.",
    name: "Sardor Rahimov",
    role: "Bosh muharrir",
    company: "Nashr Media",
  },
];

export interface Client {
  name: string;
  logo: string;
}

export const clients: Client[] = [
  { name: "AIFU", logo: "/images/clients/aifu.webp" },
  { name: "Yetakchilar Akademiyasi", logo: "/images/clients/yetakchilar.webp" },
  { name: "Melek", logo: "/images/clients/melek.webp" },
  { name: "AllSolar", logo: "/images/clients/allsolar.webp" },
  { name: "Kiias", logo: "/images/clients/kiias.webp" },
  { name: "Oxus University", logo: "/images/clients/oxus.webp" },
  { name: "Andy's Kitchen", logo: "/images/clients/andys.webp" },
  { name: "Arbol", logo: "/images/clients/arbol.webp" },
  { name: "Mohir", logo: "/images/clients/mohir.webp" },
  { name: "Ansor", logo: "/images/clients/ansor.webp" },
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
