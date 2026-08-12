"use client";

import { useActionState, useRef } from "react";
import type { FormState } from "@/panel/form-state";
import { ImageDrop, ImageStack } from "@/panel/ImageDrop";
import type { MediaOption } from "@/panel/media";
import type { ProjectFormData } from "@/panel/projects-data";
import { saveProject } from "@/panel/projects-actions";
import { autosaveLabel, useAutosave } from "@/panel/useAutosave";
import { SLOTS } from "@/panel/slots";
import { Area, Card, Choice, Collapse, Field, Grid, SaveBar, Toggle } from "@/panel/ui";

const CATEGORIES = ["Branding", "Web", "UI/UX", "Print"].map((c) => ({ value: c, label: c }));

export function ProjectForm({ data, media }: { data: ProjectFormData; media: MediaOption[] }) {
  const [state, action] = useActionState<FormState, FormData>(saveProject.bind(null, data.id), {});
  const form = useRef<HTMLFormElement>(null);
  const auto = useAutosave(form, data.id);

  return (
    <form ref={form} data-collection="projects" action={action} className="flex flex-col gap-8">
      <Card title="Loyiha haqida">
        <Field label="Nomi" name="title" defaultValue={data.title} required />
        <Grid>
          <Field label="Mijoz" name="client" defaultValue={data.client} required />
          <Field label="Yil" name="year" defaultValue={data.year} required />
        </Grid>
        <Grid>
          <Choice label="Turi" name="category" options={CATEGORIES} defaultValue={data.category} />
          <ImageDrop label="Asosiy rasm" name="cover" options={media} defaultValue={data.cover} required />
        </Grid>
        <Area
          label="Nima qilingan"
          hint="Har bir xizmat alohida qatorda."
          name="services"
          defaultValue={data.services}
          rows={4}
        />
        <Toggle
          label="Bosh sahifada ko'rsatilsin"
          hint="Belgilanganlar bosh sahifadagi tanlangan ishlar qatoriga tushadi."
          name="featured"
          defaultChecked={data.featured}
        />
      </Card>

      <Card title="Matn">
        <Area label="Vazifa" name="brief" defaultValue={data.brief} rows={5} required />
        <Area label="Yechim" name="solution" defaultValue={data.solution} rows={6} required />
      </Card>

      <Card title="Rasm va video">
        <ImageStack
          label="Loyiha galereyasi"
          hint="Rasm ham, video ham (MP4 yoki WebM, 20 MB gacha). Video saytda gif kabi chiqadi — ovozsiz, boshqaruvsiz va o'zi aylanadi, shuning uchun qisqa kadr qo'ying. Bir nechta faylni birdan tashlashingiz mumkin; tartibni strelkalar bilan o'zgartiring."
          name="gallery"
          options={media}
          defaultValue={data.gallery}
          video
        />
      </Card>

      <Collapse title="Natijalar" hint="Raqamlar — ixtiyoriy. To'ldirilmagani chiqmaydi.">
        {Array.from({ length: SLOTS.metrics }, (_, i) => (
          <Grid key={i}>
            <Field
              label={`${i + 1}-ko'rsatkich`}
              name={`results.${i}.label`}
              defaultValue={data.results[i]?.label}
              placeholder="Brend tanilishi o'sishi"
            />
            <Field
              label="Qiymati"
              name={`results.${i}.value`}
              defaultValue={data.results[i]?.value}
              placeholder="+64%"
            />
          </Grid>
        ))}
      </Collapse>

      <Collapse title="Sahifa manzili" hint="Nomdan avtomatik olinadi. Ochilgan sahifaning havolasi o'zgaradi.">
        <Field label="Manzil" name="slug" defaultValue={data.slug} placeholder="allsolar" />
      </Collapse>

      {/* Tartib — ro'yxatdagi ikkita strelka, bu yerda hech qachon raqam terilmaydi. */}
      <input type="hidden" name="order" value={data.order} />

      {state.error && <p className="text-body text-ember">{state.error}</p>}
      <SaveBar label="Saqlash va chop etish" note={state.ok ? "Chop etildi." : autosaveLabel(auto)} />
    </form>
  );
}
