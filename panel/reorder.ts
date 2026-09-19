/**
 * Ro'yxatda bitta elementni qo'shnisi bilan almashtirib, `order` ni
 * ko'rsatilgan tartib bo'yicha qayta raqamlaydi. Faqat o'zgargan yozuvlarni
 * qaytaradi — ular bazaga yoziladi.
 *
 * `docs` — panelda KO'RSATILGAN tartibda. `descending` — ro'yxat `order`
 * kamayishi bo'yicha ko'rsatiladimi (loyihalar: yangisi tepada). Usiz
 * "yuqoriga" tugmasi kamayish ro'yxatida elementni pastga tushirardi.
 *
 * Nega qayta raqamlash, ikki qiymatni almashtirish emas: `order` da bo'shliq
 * va takror bo'lishi mumkin (o'chirilgan yozuv, `max + 1`, seed'dagi qo'lda
 * qo'yilgan raqamlar). Ikki qiymatni almashtirish takrorda hech narsani
 * siljitmasdi, pozitsiyani yozish esa bo'shliqda boshqa yozuv bilan to'qnashardi.
 * Qiymatlar allaqachon 0…n−1 bo'lsa, faqat ikkita yozuv o'zgaradi.
 */
export function reorder(
  docs: readonly { id: number; order: number }[],
  id: number,
  direction: "up" | "down",
  descending: boolean,
): { id: number; order: number }[] {
  const index = docs.findIndex((d) => d.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= docs.length) return [];

  const next = [...docs];
  [next[index], next[swapWith]] = [next[swapWith], next[index]];

  const rank = (i: number) => (descending ? next.length - 1 - i : i);
  return next
    .map((d, i) => ({ id: d.id, order: rank(i), was: d.order }))
    .filter((d) => d.order !== d.was)
    .map(({ id, order }) => ({ id, order }));
}
