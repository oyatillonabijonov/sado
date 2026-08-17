'use client';

import { useActionState, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { isVideo } from '@/lib/site-format';
import { deleteMedia, uploadMedia } from '@/panel/media-actions';
import type { FormState } from '@/panel/form-state';
import { Card, Empty, Field } from '@/panel/ui';

export type MediaRow = { id: number; url: string; alt: string; filename: string; size: string };

/**
 * Rasmlar — upload here, pick everywhere else.
 *
 * The alt text is a required field with an explanation rather than an optional
 * one with a label, because it is the only accessibility decision the studio
 * makes in this panel and nobody fills in a field called "alt".
 */
export function MediaScreen({ rows }: { rows: MediaRow[] }) {
  const [state, action] = useActionState<FormState, FormData>(uploadMedia, {});

  return (
    <div className="flex flex-col gap-8">
      <Card title="Yangi fayl" hint="Rasm: JPG, PNG, WebP, AVIF, GIF, SVG — 8 MB gacha. Video: MP4, WebM, MOV — 20 MB gacha.">
        {/* `key` on the form: React keeps the file input's value across a
            successful submit otherwise, so the same picture uploads twice on a
            second click. Remounting clears it. */}
        <form key={state.ok ? 'sent' : 'idle'} action={action} className="flex flex-col gap-6">
          <input
            type="file"
            name="file"
            accept="image/*,video/mp4,video/webm"
            required
            className="w-full rounded-card border border-mist bg-white p-4 text-body file:mr-4 file:rounded-pill file:border-0 file:bg-obsidian file:px-5 file:py-2 file:text-body-sm file:text-white"
          />
          <Field
            label="Faylda nima ko‘rinadi"
            hint="Bir jumla. Ko‘rmaydigan odamlarga va qidiruv tizimlariga shu matn o‘qib beriladi."
            name="alt"
            required
          />
          <UploadButton />
          {state.error && <p className="text-body text-ember">{state.error}</p>}
          {state.ok && <p className="text-body text-pebble">Yuklandi.</p>}
        </form>
      </Card>

      {rows.length === 0 ? (
        <Empty
          title="Hozircha rasm yuklanmagan."
          hint="Yuqoridagi maydondan rasm yuklang — keyin uni loyiha yoki maqola ichidan tanlaysiz."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <MediaCard key={row.id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start rounded-pill bg-obsidian px-8 py-4 text-body text-white transition hover:bg-pebble disabled:bg-mist disabled:text-driftwood"
    >
      {pending ? 'Yuklanmoqda…' : 'Yuklash'}
    </button>
  );
}

function MediaCard({ row }: { row: MediaRow }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <li className="flex flex-col gap-3 rounded-card border border-mist p-4">
      <div className="aspect-[4/3] overflow-hidden rounded-card border border-mist bg-white">
        {/* Video kutubxonada singan rasm bo'lib chiqardi. */}
        {isVideo(row.url) ? (
          <video src={row.url} className="size-full object-cover" muted loop autoPlay playsInline />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.url} alt={row.alt} className="size-full object-cover" />
        )}
      </div>
      <span className="text-body-sm">{row.alt}</span>
      <span className="truncate text-body-sm text-driftwood">
        {row.filename} · {row.size}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await deleteMedia(row.id);
            setError(result.error ?? null);
          })
        }
        className="self-start text-body-sm text-pebble underline underline-offset-4 hover:text-ember disabled:text-mist"
      >
        O‘chirish
      </button>
      {error && <span className="text-body-sm text-ember">{error}</span>}
    </li>
  );
}
