import { describe, expect, test } from "bun:test";
import { reorder } from "@/panel/reorder";

/** O'zgarishlarni qo'llab, ko'rsatiladigan tartibni qaytaradi. */
function apply(
  docs: { id: number; order: number }[],
  updates: { id: number; order: number }[],
  descending: boolean,
) {
  const next = docs.map((d) => ({ ...d, order: updates.find((u) => u.id === d.id)?.order ?? d.order }));
  return next.sort((a, b) => (descending ? b.order - a.order : a.order - b.order)).map((d) => d.id);
}

describe("reorder", () => {
  test("o'sish tartibi (xizmatlar): yuqoriga — faqat ikki yozuv o'zgaradi", () => {
    const docs = [
      { id: 1, order: 0 },
      { id: 2, order: 1 },
      { id: 3, order: 2 },
    ];
    const u = reorder(docs, 3, "up", false);
    expect(u).toHaveLength(2);
    expect(apply(docs, u, false)).toEqual([1, 3, 2]);
  });

  /**
   * ASOSIY HOLAT. Loyihalar kamayish tartibida (yangisi tepada). Yo'nalish
   * hisobga olinmasa, "yuqoriga" loyihani saytda pastga tushirardi.
   */
  test("kamayish tartibi (loyihalar): yuqoriga — saytda ham yuqoriga", () => {
    const docs = [
      { id: 7, order: 2 },
      { id: 6, order: 1 },
      { id: 5, order: 0 },
    ];
    expect(apply(docs, reorder(docs, 6, "up", true), true)).toEqual([6, 7, 5]);
    expect(apply(docs, reorder(docs, 6, "down", true), true)).toEqual([7, 5, 6]);
  });

  test("bo'shliqli raqamlar (o'chirilgan yozuv, max+1) to'qnashmaydi", () => {
    const docs = [
      { id: 9, order: 9 },
      { id: 4, order: 4 },
      { id: 1, order: 1 },
    ];
    expect(apply(docs, reorder(docs, 1, "up", true), true)).toEqual([9, 1, 4]);
  });

  test("takror raqamlar ham siljiydi", () => {
    const docs = [
      { id: 1, order: 0 },
      { id: 2, order: 0 },
    ];
    expect(apply(docs, reorder(docs, 2, "up", false), false)).toEqual([2, 1]);
  });

  test("chetdagi elementni chegaradan tashqariga surish — hech narsa yozilmaydi", () => {
    const docs = [
      { id: 1, order: 1 },
      { id: 2, order: 0 },
    ];
    expect(reorder(docs, 1, "up", true)).toEqual([]);
    expect(reorder(docs, 2, "down", true)).toEqual([]);
  });
});
