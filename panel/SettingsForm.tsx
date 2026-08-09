"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/panel/form-state";
import { ImageStack } from "@/panel/ImageDrop";
import type { MediaOption } from "@/panel/media";
import { saveSettings } from "@/panel/settings-actions";
import type { SettingsFormData, SocialRow } from "@/panel/settings-data";
import { Area, Card, Field, GhostButton, Grid, SaveBar } from "@/panel/ui";

export function SettingsForm({ data, media }: { data: SettingsFormData; media: MediaOption[] }) {
  const [state, action] = useActionState<FormState, FormData>(saveSettings, {});
  // Ijtimoiy tarmoqlar soni oldindan ma'lum emas: bugun to'rtta, ertaga
  // beshta bo'lishi mumkin. Shuning uchun qat'iy slot emas, qo'shiladigan
  // qator — bo'sh qolganlari saqlashda tushib qoladi.
  const [socials, setSocials] = useState<SocialRow[]>(
    data.socials.length ? data.socials : [{ label: "", href: "" }],
  );

  return (
    <form action={action} className="flex flex-col gap-8">
      <Card title="Bosh sahifa" hint="Saytga kirgan odam birinchi ko'radigan matn.">
        <Field
          label="Sarlavha ustidagi qator"
          name="heroKicker"
          defaultValue={data.heroKicker}
          placeholder="Dizayn agentligi — Toshkent, 2018-yildan"
        />
        <Area
          label="Katta sarlavha"
          hint="Yangi qatordan boshlansa, saytda ham yangi qatorga tushadi."
          name="heroHeading"
          defaultValue={data.heroHeading}
          rows={3}
        />
        <ImageStack
          label="Orqa fon rasmlari"
          hint="Hero'da 3 soniyada almashib turadi. Sudrab tashlang yoki tanlang; tartibni strelkalar bilan o'zgartiring. Bo'sh qoldirilsa standart rasmlar chiqadi."
          name="heroImages"
          options={media}
          defaultValue={data.heroImages}
        />
        <ImageStack
          label="Telefon uchun rasmlar"
          hint="Tik (vertikal) kadrlar — telefonda shular chiqadi. Tartibi yuqoridagi bilan bir xil bo'lsin: birinchisi birinchisining o'rnini oladi. Bo'sh qoldirilsa yuqoridagi rasmlar ishlatiladi, lekin telefon ekrani tor bo'lgani uchun ularning chetlari qirqiladi."
          name="heroImagesMobile"
          options={media}
          defaultValue={data.heroImagesMobile}
        />
      </Card>

      <Card title="Aloqa" hint="Bu ma'lumotlar futerda va aloqa bo'limida chiqadi.">
        <Grid>
          <Field label="Email" name="email" type="email" defaultValue={data.email} />
          <Field label="Telefon" name="phone" type="tel" defaultValue={data.phone} />
        </Grid>
        <Field label="Manzil" name="address" defaultValue={data.address} />
      </Card>

      <Card title="Ijtimoiy tarmoqlar">
        {socials.map((row, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex-1">
              <Field
                label="Nomi"
                name={`socials.${i}.label`}
                defaultValue={row.label}
                placeholder="Instagram"
              />
            </div>
            <div className="flex-[2]">
              <Field
                label="Havola"
                name={`socials.${i}.href`}
                defaultValue={row.href}
                placeholder="https://instagram.com/sado"
              />
            </div>
            <button
              type="button"
              onClick={() => setSocials((prev) => prev.filter((_, j) => j !== i))}
              className="min-h-14 shrink-0 rounded-pill border border-mist px-5 text-body-sm text-pebble transition-colors hover:border-obsidian hover:text-obsidian"
            >
              O‘chirish
            </button>
          </div>
        ))}
        <GhostButton onClick={() => setSocials((prev) => [...prev, { label: "", href: "" }])}>
          + Yana bitta
        </GhostButton>
      </Card>

      <Card title="Qidiruv tizimlari" hint="Google natijalarida sayt nomi ostida chiqadigan matn.">
        <Area label="Tavsif" name="description" defaultValue={data.description} rows={3} />
      </Card>

      {state.error && <p className="text-body text-ember">{state.error}</p>}
      <SaveBar note={state.ok ? "Saqlandi." : undefined} />
    </form>
  );
}
