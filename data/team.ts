export interface TeamMember {
  name: string;
  role: string;
  /** Yo'q bo'lsa bosh harflar chiqadi. Placeholder surat qo'ymang: ular
   *  ichida hardcode qilingan fon bilan keladi va light mode'da qora
   *  plitaga aylanadi. */
  photo?: string;
}

export const team: TeamMember[] = [
  { name: "Aziz Rahimov", role: "Asoschi, kreativ direktor" },
  { name: "Malika Yusupova", role: "Dizayn direktori" },
  { name: "Jasur Karimov", role: "Katta brend dizayneri" },
  { name: "Nilufar Azimova", role: "UX yetakchisi" },
  { name: "Sardor Toshev", role: "Frontend muhandisi" },
  { name: "Zilola Nazarova", role: "Loyiha menejeri" },
];

export const values = [
  {
    title: "Sukunatga ishonamiz",
    text: "Yaxshi dizayn baqirmaydi. Biz ortiqcha elementni olib tashlashdan qo'rqmaymiz.",
  },
  {
    title: "Ish o'zi gapiradi",
    text: "Taqdimotdan ko'ra natija muhim. Har bir loyiha o'lchanadigan maqsad bilan boshlanadi.",
  },
  {
    title: "Uzoq hamkorlik",
    text: "Mijozlarimizning aksariyati biz bilan yillar davomida ishlaydi.",
  },
];

export const stats = [
  { label: "Tashkil etilgan", value: "2018" },
  { label: "Yakunlangan loyihalar", value: "120+" },
  { label: "Doimiy mijozlar", value: "66" },
  { label: "Jamoa a'zolari", value: "11" },
];
