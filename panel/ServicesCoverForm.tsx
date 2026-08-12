"use client";

import { useActionState } from "react";
import type { FormState } from "@/panel/form-state";
import { ImageDrop } from "@/panel/ImageDrop";
import type { MediaOption } from "@/panel/media";
import { saveServicesCover } from "@/panel/settings-actions";
import { Card, SaveBar } from "@/panel/ui";

/**
 * Xizmatlar sahifasining muqovasi — **shu ekranda**, Sozlamalarda emas.
 *
 * U texnik jihatdan `settings` globalining maydoni va dastlab o'sha yerda
 * turardi. Mijoz esa muqovani almashtirish uchun tabiiy ravishda
 * «Xizmatlar» bo'limiga kirdi, topmadi va "bunday imkoniyat yo'q" degan
 * xulosaga keldi. Maydon qayerda saqlanishi — bizning ishimiz; u qayerda
 * ko'rinishi — mijozning mantig'i.
 *
 * Alohida kichik forma: xizmatlar ro'yxati server komponent va uni butunlay
 * formaga o'rash strelkalar bilan tartiblashni buzardi.
 */
export function ServicesCoverForm({
  cover,
  media,
}: {
  cover: number | null;
  media: MediaOption[];
}) {
  const [state, action] = useActionState<FormState, FormData>(saveServicesCover, {});

  return (
    <form action={action}>
      <Card
        title="Sahifa muqovasi"
        hint="Xizmatlar sahifasining boshidagi keng kadr — ro'yxatdan oldin turadi."
      >
        <ImageDrop
          label="Muqova rasmi"
          hint="Desktopda 16:5, telefonda 16:9 qilib kesiladi — asosiy narsa markazda bo'lgan yotiq rasm tanlang. Bo'sh qoldirilsa saytdagi standart rasm chiqadi."
          name="servicesCover"
          options={media}
          defaultValue={cover}
        />
        {state.error && <p className="text-body text-ember">{state.error}</p>}
        <SaveBar note={state.ok ? "Saqlandi." : undefined} />
      </Card>
    </form>
  );
}
