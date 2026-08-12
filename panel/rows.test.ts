import { expect, test } from "bun:test";
import { readRows } from "@/panel/rows";

/**
 * `readRows` — `RepeatRows` yozgan `<prefix>.<i>.<maydon>` kalitlarini o'qiydi.
 *
 * To'rtta ekran shunga tayanadi (raqamlar, ijtimoiy tarmoqlar, qadriyatlar,
 * jamoa) va uning har bir xatosi **jimgina** kechadi: noto'g'ri saralash
 * qatorlarni aralashtiradi, noto'g'ri filtr esa mijozning yozganini yo'qotadi.
 * Ikkalasi ham faqat saytga qaraganda ko'rinadi.
 */

const form = (pairs: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(pairs)) fd.set(k, v);
  return fd;
};

test("qatorlarni tartibda o'qiydi", () => {
  const fd = form({
    "stats.0.value": "120+",
    "stats.0.label": "Loyihalar",
    "stats.1.value": "66",
    "stats.1.label": "Mijozlar",
  });
  expect(readRows(fd, "stats", ["value", "label"])).toEqual([
    { value: "120+", label: "Loyihalar" },
    { value: "66", label: "Mijozlar" },
  ]);
});

test("indekslarni raqam sifatida saralaydi", () => {
  // Matn bo'yicha saralansa "10" "2" dan oldin kelardi va o'ninchi qator
  // uchinchi bo'lib chiqardi. Mijoz o'nta xizmat qo'shsa shu yerda ko'rinadi.
  const fd = new FormData();
  for (const i of [0, 1, 2, 10, 11]) fd.set(`v.${i}.title`, `#${i}`), fd.set(`v.${i}.text`, "matn");
  expect(readRows(fd, "v", ["title", "text"]).map((r) => r.title)).toEqual([
    "#0",
    "#1",
    "#2",
    "#10",
    "#11",
  ]);
});

test("to'ldirilmagan qatorni tashlaydi", () => {
  const fd = form({
    "v.0.title": "Bor",
    "v.0.text": "matn",
    "v.1.title": "",
    "v.1.text": "",
    "v.2.title": "Yarim",
    "v.2.text": "",
  });
  expect(readRows(fd, "v", ["title", "text"])).toEqual([{ title: "Bor", text: "matn" }]);
});

test("ixtiyoriy maydon bo'sh bo'lishi mumkin", () => {
  // Jamoa a'zosining surati — suratsiz odam saytda bosh harflari bilan
  // chiqadi, ya'ni bu qator to'liq hisoblanadi.
  const fd = form({
    "team.0.name": "Aziz",
    "team.0.role": "Direktor",
    "team.0.photo": "",
    "team.1.name": "",
    "team.1.role": "Dizayner",
    "team.1.photo": "7",
  });
  expect(readRows(fd, "team", ["name", "role", "photo"], ["photo"])).toEqual([
    { name: "Aziz", role: "Direktor", photo: "" },
  ]);
});

test("bo'shliqlarni kesadi va bo'sh prefiksda bo'sh massiv qaytaradi", () => {
  const fd = form({ "v.0.title": "  Bor  ", "v.0.text": "  matn " });
  expect(readRows(fd, "v", ["title", "text"])).toEqual([{ title: "Bor", text: "matn" }]);
  expect(readRows(fd, "boshqa", ["title", "text"])).toEqual([]);
});

test("boshqa prefiks bilan boshlanuvchi kalitlarni aralashtirmaydi", () => {
  // `heroImages` va `heroImagesMobile` shu tuzoqqa yaqin turadi.
  const fd = form({
    "v.0.title": "Asosiy",
    "v.0.text": "matn",
    "vMobile.0.title": "Boshqa",
    "vMobile.0.text": "matn",
  });
  expect(readRows(fd, "v", ["title", "text"])).toEqual([{ title: "Asosiy", text: "matn" }]);
});
