"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_LOCALE, type PanelLocale } from "@/panel/locale";

export type AutosaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: Date }
  | { kind: "error"; message: string };

/**
 * Formani o'zi saqlaydi — yozgan narsa yo'qolmasin.
 *
 * Formaga `ref` qo'yiladi; har bir o'zgarishdan keyin 2 soniya jim turilsa,
 * butun FormData qoralama sifatida yuboriladi. 2s — yozayotgan odam so'z
 * orasida shuncha to'xtaydi, ya'ni har harfda so'rov ketmaydi.
 *
 * Uchta narsa ataylab shunday:
 *
 * 1. **Faqat mavjud yozuv uchun.** Hali saqlanmagan yangi maqolada har bir
 *    tugmacha yangi hujjat yaratib ketardi. Birinchi "Saqlash" dan keyin
 *    avtosaqlash o'zi ishlay boshlaydi.
 * 2. **Ketma-ket, ustma-ust emas.** Yuborish davom etayotganda yangi so'rov
 *    boshlanmaydi, o'zgarish esa belgilab qo'yiladi va navbatda yuboriladi —
 *    aks holda kechroq jo'natilgan eski holat yangisini bosib ketishi mumkin.
 * 3. **Sahifadan chiqishda ogohlantirish.** Saqlanmagan o'zgarish qolgan
 *    bo'lsa brauzer so'raydi.
 */
export function useAutosave(
  form: React.RefObject<HTMLFormElement | null>,
  id: number | null,
  locale: PanelLocale = DEFAULT_LOCALE,
) {
  const [state, setState] = useState<AutosaveState>({ kind: "idle" });
  const dirty = useRef(false);
  const sending = useRef(false);

  useEffect(() => {
    const el = form.current;
    if (!el || id === null) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const send = async () => {
      if (sending.current) return;
      sending.current = true;
      setState({ kind: "saving" });
      try {
        const fd = new FormData(el);
        fd.set("__collection", el.dataset.collection ?? "");
        fd.set("__id", String(id));
        // Qoralama qaysi tilga yozilishi kerakligi — usiz ruscha ekranda
        // yozilgan matn o'zbekcha qoralamani bosib ketardi.
        fd.set("__locale", locale);
        const res = await fetch("/api/panel/autosave", { method: "POST", body: fd });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Saqlanmadi");
        dirty.current = false;
        setState({ kind: "saved", at: new Date() });
      } catch (e) {
        setState({ kind: "error", message: e instanceof Error ? e.message : String(e) });
      } finally {
        sending.current = false;
        // Yuborish davomida yana yozilgan bo'lsa — darhol navbatdagisi.
        if (dirty.current) void send();
      }
    };

    const touch = () => {
      dirty.current = true;
      clearTimeout(timer);
      timer = setTimeout(() => void send(), 2000);
    };

    el.addEventListener("input", touch);
    el.addEventListener("change", touch);

    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);

    return () => {
      clearTimeout(timer);
      el.removeEventListener("input", touch);
      el.removeEventListener("change", touch);
      window.removeEventListener("beforeunload", warn);
    };
  }, [form, id, locale]);

  return state;
}

export function autosaveLabel(state: AutosaveState): string | undefined {
  switch (state.kind) {
    case "saving":
      return "Saqlanmoqda…";
    case "saved":
      return `Qoralama saqlandi ${state.at.getHours().toString().padStart(2, "0")}:${state.at
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    case "error":
      return `Saqlanmadi: ${state.message}`;
    default:
      return undefined;
  }
}
