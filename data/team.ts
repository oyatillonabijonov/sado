export interface TeamMember {
  name: string;
  role: string;
  photo: string;
}

export const team: TeamMember[] = [
  { name: "Aziz Rahimov", role: "Asoschi, kreativ direktor", photo: "/images/team/1.svg" },
  { name: "Malika Yusupova", role: "Dizayn direktori", photo: "/images/team/2.svg" },
  { name: "Jasur Karimov", role: "Katta brend dizayneri", photo: "/images/team/3.svg" },
  { name: "Nilufar Azimova", role: "UX yetakchisi", photo: "/images/team/4.svg" },
  { name: "Sardor Toshev", role: "Frontend muhandisi", photo: "/images/team/5.svg" },
  { name: "Zilola Nazarova", role: "Loyiha menejeri", photo: "/images/team/6.svg" },
];

export const values = [
  {
    title: "Sukunatga ishonamiz",
    text: "Placeholder matn: yaxshi dizayn baqirmaydi. Biz ortiqcha elementni olib tashlashdan qo'rqmaymiz.",
  },
  {
    title: "Ish o'zi gapiradi",
    text: "Placeholder matn: taqdimotdan ko'ra natija muhim. Har bir loyiha o'lchanadigan maqsad bilan boshlanadi.",
  },
  {
    title: "Uzoq hamkorlik",
    text: "Placeholder matn: mijozlarimizning aksariyati biz bilan yillar davomida ishlaydi.",
  },
];

export const stats = [
  { label: "Tashkil etilgan", value: "2018" },
  { label: "Yakunlangan loyihalar", value: "120+" },
  { label: "Doimiy mijozlar", value: "66" },
  { label: "Jamoa a'zolari", value: "11" },
];
