"use client";

import { useActionState } from "react";
import { BlockEditor } from "@/panel/BlockEditor";
import type { FormState } from "@/panel/form-state";
import { MediaPicker, type MediaOption } from "@/panel/MediaPicker";
import type { PostFormData } from "@/panel/posts-data";
import { savePost } from "@/panel/posts-actions";
import { BigField, Card, Collapse, Field, Grid, SaveBar } from "@/panel/ui";

export function PostForm({ data, media }: { data: PostFormData; media: MediaOption[] }) {
  const [state, action] = useActionState<FormState, FormData>(savePost.bind(null, data.id), {});

  return (
    <form action={action} className="flex flex-col gap-8">
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
          <MediaPicker label="Muqova rasmi" name="cover" options={media} defaultValue={data.cover} required />
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
        <SaveBar note={state.ok ? "Saqlandi." : undefined} />
      )}
    </form>
  );
}
