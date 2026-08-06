/**
 * Ro'yxatli maydonlar (xizmatlar, "nima olasiz") — har bir element alohida
 * qatorda yoziladigan bitta textarea.
 *
 * Direktiva yo'q: raqamlar/yordamchilar client forma va server action'da bir
 * xil kerak, `'use server'` moduli esa faqat async funksiya eksport qila oladi.
 *
 * ponytail: qo'sh/o'chir tugmali dinamik ro'yxat emas. Bir qator — bir element,
 * bo'shlari tashlanadi. Tartib muhim bo'lganda drag-and-drop qo'shiladi.
 */
export const toLines = (value: unknown): string =>
  Array.isArray(value) ? value.filter(Boolean).join("\n") : "";

export const fromLines = (value: FormDataEntryValue | null): string[] =>
  String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
