/**
 * «Biz haqimizda» sahifasining zaxira matni.
 *
 * Kontent `globals/About.ts` da (panel: /panel/biz-haqimizda). Bu yerdagi
 * qiymatlar global hali to'ldirilmagan bo'lsa chiqadi — `getTestimonials`
 * bilan bir xil naqsh. Zaxirasiz bo'lsa bu global qo'shilgan deploy'dan keyin
 * sahifa bo'sh chiqardi: `db-ensure` yangi jadvalni **bo'sh** yaratadi.
 *
 * Bu yerni tahrirlash saytni o'zgartirmaydi — global to'ldirilgan zahoti
 * ustidan yoziladi. Paneldan foydalaning.
 *
 * Qadriyatlar va jamoa `data/team.ts` da qoladi (`values`, `team`) — ular
 * `scripts/seed.ts` ga ham kerak.
 */
export const about = {
  lead: "Mustaqil, kichik va ataylab shunday: har bir loyihada shu sahifadagi odamlar ishlaydi.",
  story:
    "SADO 2018-yilda uch dizayner tomonidan tashkil etilgan. Bugun biz o'n bir kishilik jamoa bilan brend, veb va raqamli mahsulotlar ustida ishlaymiz.",
  mission:
    "Missiyamiz — O'zbekiston brendlarini jahon darajasidagi dizayn tili bilan gapirishga o'rgatish. Biz shovqin emas, aniqlik sotamiz.",
  contactHeading: "Jamoamiz bilan ishlang.",
  contactText: "Vazifangizni qisqacha yozing — bir ish kuni ichida javob beramiz.",
};
