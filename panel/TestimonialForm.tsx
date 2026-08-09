"use client";

import { useActionState } from "react";
import type { FormState } from "@/panel/form-state";
import { saveTestimonial } from "@/panel/testimonials-actions";
import type { TestimonialFormData } from "@/panel/testimonials-data";
import { Area, Card, Field, Grid, SaveBar } from "@/panel/ui";

export function TestimonialForm({ data }: { data: TestimonialFormData }) {
  const [state, action] = useActionState<FormState, FormData>(
    saveTestimonial.bind(null, data.id),
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-8">
      <Card title="Otziv">
        <Area
          label="Matn"
          hint="Mijozning o'z so'zlari bilan. Uzunligi cheklanmagan — saytda karta matnga qarab o'sadi."
          name="quote"
          defaultValue={data.quote}
          rows={6}
          required
        />
      </Card>

      <Card title="Kim aytgan" hint="Ism va lavozim otziv ostida chiqadi.">
        <Field label="Ism" name="name" defaultValue={data.name} placeholder="Jahongir Shukurov" required />
        <Grid>
          <Field label="Lavozim" name="role" defaultValue={data.role} placeholder="Asoschi" />
          <Field label="Kompaniya" name="company" defaultValue={data.company} placeholder="AllSolar" />
        </Grid>
      </Card>

      <input type="hidden" name="order" value={data.order} />

      {state.error && <p className="text-body text-ember">{state.error}</p>}
      <SaveBar note={state.ok ? "Saqlandi." : undefined} />
    </form>
  );
}
