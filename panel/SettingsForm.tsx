"use client";

import { useActionState, useRef, useState } from "react";
import type { FormState } from "@/panel/form-state";
import { ImageDrop, ImageStack } from "@/panel/ImageDrop";
import type { MediaOption } from "@/panel/media";
import { saveSettings } from "@/panel/settings-actions";
import type { SettingsFormData } from "@/panel/settings-data";
import { Area, Card, Field, GhostButton, Grid, SaveBar } from "@/panel/ui";

type FieldSpec = { key: string; label: string; placeholder?: string; grow?: number };

/**
 * Qo'shiladigan qatorlar ro'yxati — ijtimoiy tarmoqlar va raqamlar.
 *
 * Qatorlar soni oldindan ma'lum emas: bugun to'rtta, ertaga beshta bo'lishi
 * mumkin. Shuning uchun qat'iy slot emas — bo'sh qolgan qator saqlashda
 * tushib qoladi (`settings-actions.ts`).
 *
 * `key` indeks emas, o'sib boradigan raqam. `Field` boshqarilmaydigan input
 * ustiga qurilgan: indeks bilan kalitlanganda o'rtadagi qator o'chirilsa
 * React DOM tugunini qayta ishlatardi, `defaultValue` esa qayta qo'llanmaydi —
 * ekranda o'chirilgan qatorning matni qolib ketardi.
 */
function RepeatRows({
  name,
  initial,
  fields,
}: {
  name: string;
  initial: Record<string, string>[];
  fields: FieldSpec[];
}) {
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, ""]));
  const [rows, setRows] = useState(() =>
    (initial.length ? initial : [blank()]).map((values, i) => ({ key: i, values })),
  );
  const nextKey = useRef(rows.length);

  return (
    <>
      {rows.map((row, i) => (
        <div key={row.key} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
          {fields.map((f) => (
            <div key={f.key} style={{ flex: f.grow ?? 1 }}>
              <Field
                label={f.label}
                name={`${name}.${i}.${f.key}`}
                defaultValue={row.values[f.key] ?? ""}
                placeholder={f.placeholder}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
            className="min-h-14 shrink-0 rounded-pill border border-mist px-5 text-body-sm text-pebble transition-colors hover:border-obsidian hover:text-obsidian"
          >
            O‘chirish
          </button>
        </div>
      ))}
      <GhostButton
        onClick={() => setRows((prev) => [...prev, { key: nextKey.current++, values: blank() }])}
      >
        + Yana bitta
      </GhostButton>
    </>
  );
}

export function SettingsForm({ data, media }: { data: SettingsFormData; media: MediaOption[] }) {
  const [state, action] = useActionState<FormState, FormData>(saveSettings, {});

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

      <Card title="Xizmatlar sahifasi">
        <ImageDrop
          label="Muqova rasmi"
          hint="Sahifa boshidagi keng kadr. Desktopda 16:5, telefonda 16:9 qilib kesiladi — asosiy narsa markazda bo'lgan yotiq rasm tanlang. Bo'sh qoldirilsa standart rasm chiqadi."
          name="servicesCover"
          options={media}
          defaultValue={data.servicesCover}
        />
      </Card>

      <Card title="Aloqa" hint="Bu ma'lumotlar futerda va aloqa bo'limida chiqadi.">
        <Grid>
          <Field label="Email" name="email" type="email" defaultValue={data.email} />
          <Field label="Telefon" name="phone" type="tel" defaultValue={data.phone} />
        </Grid>
        <Field label="Manzil" name="address" defaultValue={data.address} />
      </Card>

      <Card
        title="Raqamlar"
        hint="Bosh sahifada, otzivlar bilan bir bandda. Har biri alohida karta bo'lib chiqadi."
      >
        <RepeatRows
          name="stats"
          initial={data.stats}
          fields={[
            { key: "value", label: "Raqam", placeholder: "120+" },
            { key: "label", label: "Yorliq", placeholder: "Yakunlangan loyihalar", grow: 2 },
          ]}
        />
      </Card>

      <Card title="Ijtimoiy tarmoqlar">
        <RepeatRows
          name="socials"
          initial={data.socials}
          fields={[
            { key: "label", label: "Nomi", placeholder: "Instagram" },
            { key: "href", label: "Havola", placeholder: "https://instagram.com/sado", grow: 2 },
          ]}
        />
      </Card>

      <Card title="Qidiruv tizimlari" hint="Google natijalarida sayt nomi ostida chiqadigan matn.">
        <Area label="Tavsif" name="description" defaultValue={data.description} rows={3} />
      </Card>

      {state.error && <p className="text-body text-ember">{state.error}</p>}
      <SaveBar note={state.ok ? "Saqlandi." : undefined} />
    </form>
  );
}
