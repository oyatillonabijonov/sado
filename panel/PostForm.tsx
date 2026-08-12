"use client";

import { useActionState, useRef } from "react";
import { BlockEditor } from "@/panel/BlockEditor";
import type { FormState } from "@/panel/form-state";
import { ImageDrop } from "@/panel/ImageDrop";
import type { MediaOption } from "@/panel/media";
import type { PostFormData } from "@/panel/posts-data";
import { savePost } from "@/panel/posts-actions";
import { autosaveLabel, useAutosave } from "@/panel/useAutosave";
import { BigField, Card, Collapse, Field, Grid, SaveBar } from "@/panel/ui";

export function PostForm({ data, media }: { data: PostFormData; media: MediaOption[] }) {
  const [state, action] = useActionState<FormState, FormData>(savePost.bind(null, data.id), {});
  const form = useRef<HTMLFormElement>(null);
  const auto = useAutosave(form, data.id);

  return (
    <form ref={form} data-collection="posts" action={action} className="flex flex-col gap-8">
      {/* Sarlavha va lid — hujjatning o'zi, shuning uchun ramkasiz. */}
      <div className="flex flex-col gap-2">
        <BigField name="title" defaultValue={data.title} placeholder="Maqola sarlavhasi" required />
        <BigField
          name="description"
          defaultValue={data.description}
          placeholder="Bir-ikki gapda nima haqida"
          size="lead"
        />
      </div>

      <BlockEditor name="body" initial={data.blocks} media={media} />

      <Collapse title="Maqola haqida" hint="Rukn, muallif, sana va rasm.">
        <Grid>
          <Field label="Rukn" name="category" defaultValue={data.category} placeholder="UI/UX" required />
          <Field label="Muallif" name="author" defaultValue={data.author} required />
        </Grid>
        <Grid>
          <Field label="Sana" name="date" type="date" defaultValue={data.date} required />
          <ImageDrop
            label="Muqova rasmi"
            hint="16:9 yotiq kadr (masalan 1600×900). Sayt uni ro'yxatda ham, maqola ichida ham aynan shu nisbatda ko'rsatadi."
            name="cover"
            options={media}
            defaultValue={data.cover}
            required
          />
        </Grid>
        <Field label="Sahifa manzili" name="slug" defaultValue={data.slug} placeholder="qorongi-interfeyslar" />
      </Collapse>

      <input type="hidden" name="order" value={data.order} />

      {state.error && <p className="text-body text-ember">{state.error}</p>}

      {data.lossy ? (
        <Card title="Bu maqolani bu yerda tahrirlab bo'lmaydi">
          <p className="text-body text-pebble">
            Matnda jadval yoki havola bor — uni saqlasak, o'sha qismlar yo'qoladi.
            Matnni o'zgartirish kerak bo'lsa, dasturchiga murojaat qiling.
          </p>
        </Card>
      ) : (
        <SaveBar label="Saqlash va chop etish" note={state.ok ? "Chop etildi." : autosaveLabel(auto)} />
      )}
    </form>
  );
}
