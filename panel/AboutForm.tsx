"use client";

import { useActionState } from "react";
import { saveAbout } from "@/panel/about-actions";
import type { AboutFormData } from "@/panel/about-data";
import type { FormState } from "@/panel/form-state";
import type { MediaOption } from "@/panel/media";
import type { PanelLocale } from "@/panel/locale";
import { Area, Card, Field, LangSwitch, RepeatRows, SaveBar } from "@/panel/ui";

export function AboutForm({
  data,
  media,
  locale,
}: {
  data: AboutFormData;
  media: MediaOption[];
  locale: PanelLocale;
}) {
  const [state, action] = useActionState<FormState, FormData>(saveAbout.bind(null, locale), {});

  return (
    <form action={action} className="flex flex-col gap-8">
      <LangSwitch locale={locale} />
      <Card title="Sahifa boshi">
        <Area
          label="Sarlavha ostidagi qator"
          hint="Kulrang kichik matn — «Biz haqimizda» sarlavhasi ostida."
          name="lead"
          defaultValue={data.lead}
          rows={2}
        />
        <Area
          label="Birinchi xatboshi"
          hint="Kattaroq oq matn: agentlik qachon va kim tomonidan tashkil etilgan."
          name="story"
          defaultValue={data.story}
          rows={4}
        />
        <Area
          label="Ikkinchi xatboshi"
          hint="Kulrang matn: nima uchun ishlaymiz."
          name="mission"
          defaultValue={data.mission}
          rows={4}
        />
      </Card>

      <Card
        title="Qanday ishlaymiz"
        hint="Har biri alohida karta bo'lib chiqadi. To'rttasi bitta qatorga sig'adi."
      >
        <RepeatRows
          name="values"
          initial={data.values}
          addLabel="+ Yana bitta karta"
          fields={[
            { key: "title", label: "Sarlavha", placeholder: "Sukunatga ishonamiz" },
            { key: "text", label: "Matn", kind: "area" },
          ]}
        />
      </Card>

      <Card
        title="Jamoa"
        hint="Saytda 3:4 tik kadr bo'lib chiqadi. Surat qo'yilmasa odamning bosh harflari ko'rinadi."
      >
        <RepeatRows
          name="team"
          initial={data.team}
          media={media}
          addLabel="+ Yana bitta odam"
          fields={[
            { key: "name", label: "Ism", placeholder: "Aziz Rahimov" },
            { key: "role", label: "Lavozimi", placeholder: "Kreativ direktor" },
            { key: "photo", label: "Surati", kind: "image" },
          ]}
        />
      </Card>

      <Card title="Aloqa bandi" hint="Sahifaning oxiridagi forma ustidagi matn.">
        <Field
          label="Katta sarlavha"
          name="contactHeading"
          defaultValue={data.contactHeading}
          placeholder="Jamoamiz bilan ishlang."
        />
        <Area
          label="Sarlavha ostidagi matn"
          name="contactText"
          defaultValue={data.contactText}
          rows={2}
        />
      </Card>

      {state.error && <p className="text-body text-ember">{state.error}</p>}
      <SaveBar note={state.ok ? "Saqlandi." : undefined} />
    </form>
  );
}
