/**
 * `<prefix>.<i>.<maydon>` kalitlaridan qatorlar — `RepeatRows` yozganini
 * o'qiydi (`panel/ui.tsx`).
 *
 * Direktivasiz modul, `form-map.ts` da emas: u `server-only` ni tortadi
 * (`slugify` orqali) va sinovdan o'tkazib bo'lmasdi. Bu esa `FormData` ustidagi
 * sof funksiya — sinash ham, client tomondan import qilish ham mumkin.
 *
 * Indekslar birinchi maydon bo'yicha sanaladi va **raqam sifatida**
 * saralanadi: matn bo'yicha saralansa 10-qator 2-qatordan oldin kelardi.
 * To'ldirilmagan qator tushib qoladi — bo'sh qator saytda bo'sh karta bo'lib
 * chiqardi. `optional` dagi maydonlar (masalan jamoa a'zosining surati) bo'sh
 * bo'lishi mumkin.
 */
export function readRows(
  fd: FormData,
  prefix: string,
  fields: string[],
  optional: string[] = [],
): Record<string, string>[] {
  const [first] = fields;
  const value = (key: string) => String(fd.get(key) ?? "").trim();

  return [...fd.keys()]
    .filter((k) => k.startsWith(`${prefix}.`) && k.endsWith(`.${first}`))
    .map((k) => k.split(".")[1])
    .sort((a, b) => Number(a) - Number(b))
    .map((i): Record<string, string> => ({
      // Qator id'si — `RepeatRows` yashirin input bilan qaytaradi. Usiz
      // Payload massiv qatorlarini qaytadan yaratadi va **boshqa tildagi
      // matn yo'qoladi**; shuning uchun u har doim o'qiladi va hech qachon
      // "to'ldirilmagan" deb hisoblanmaydi.
      id: value(`${prefix}.${i}.id`),
      ...Object.fromEntries(fields.map((f) => [f, value(`${prefix}.${i}.${f}`)])),
    }))
    .filter((row) => fields.every((f) => optional.includes(f) || row[f]));
}

/**
 * `readRows` qatoridan Payload kutgan `id` (yangi qatorda `undefined`).
 *
 * **Raqamga o'girilmaydi.** Payload massiv qatorlariga hujjat id'sidan
 * farqli, matnli id beradi (`6a78b734d1eac6b95233b0fe`). `Number()` ularni
 * `NaN` qilardi, `NaN || undefined` esa `undefined` — ya'ni id jimgina
 * tushib qolar va Payload qatorni qaytadan yaratib, ikkinchi tildagi matnni
 * o'chirib yuborardi. Aynan shu tuzoqdan qochish uchun id olib yurilyapti.
 */
export const rowId = (row: Record<string, string>): string | undefined => row.id || undefined;
