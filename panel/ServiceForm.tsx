"use client";

import { useActionState } from "react";
import type { FormState } from "@/panel/form-state";
import type { ServiceFormData } from "@/panel/services-data";
import { saveService } from "@/panel/services-actions";
import type { PanelLocale } from "@/panel/locale";
import { Area, Card, Collapse, Field, LangSwitch, SaveBar } from "@/panel/ui";

export function ServiceForm({ data, locale }: { data: ServiceFormData; locale: PanelLocale }) {
  const [state, action] = useActionState<FormState, FormData>(
    saveService.bind(null, data.id, locale),
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-8">
      <LangSwitch locale={locale} />
      <Card title="Xizmat">
        <Field label="Nomi" name="title" defaultValue={data.title} required />
        <Area label="Tavsifi" name="description" defaultValue={data.description} rows={4} required />
        <Area
          label="Nima olasiz"
          hint="Har bir band alohida qatorda."
          name="deliverables"
          defaultValue={data.deliverables}
          rows={5}
        />
        <Area label="Kimga mos" name="fitFor" defaultValue={data.fitFor} rows={3} required />
      </Card>

      <Collapse title="Sahifa manzili" hint="Nomdan avtomatik olinadi.">
        <Field label="Manzil" name="slug" defaultValue={data.slug} placeholder="brend-strategiyasi" />
      </Collapse>

      <input type="hidden" name="order" value={data.order} />

      {state.error && <p className="text-body text-ember">{state.error}</p>}
      <SaveBar note={state.ok ? "Saqlandi." : undefined} />
    </form>
  );
}
