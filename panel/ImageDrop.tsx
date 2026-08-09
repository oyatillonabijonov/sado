'use client';

import { useCallback, useRef, useState } from 'react';
import type { MediaOption } from '@/panel/media';

/**
 * Rasmni turgan joyida yuklash.
 *
 * Butun panelning eng og'ir joyi shu edi: rasm qo'yish uchun formadan chiqib,
 * "Rasmlar" ekraniga o'tib, yuklab, qaytib kelib, `<select>` dan fayl nomi
 * bo'yicha topish kerak edi — va yozilgan matn shu yo'lda yo'qolardi.
 *
 * Bu yerda fayl `/api/panel/upload` ga `fetch` bilan ketadi. Forma yuborilmaydi,
 * sahifa qayta yuklanmaydi, hech narsa yo'qolmaydi. Formaga faqat yuklangan
 * rasmning id'si yashirin input orqali tushadi.
 *
 * Mavjud rasmni tanlash yo'li yo'qolmadi: shu komponentning ichida
 * "ilgari yuklanganlardan tanlash" bor, ya'ni eski `MediaPicker` keraksiz.
 */

export type Uploaded = MediaOption;

export async function uploadImage(file: File): Promise<Uploaded> {
  const body = new FormData();
  body.set('file', file);
  const res = await fetch('/api/panel/upload', { method: 'POST', body });
  const data = (await res.json()) as { id?: number; url?: string; label?: string; error?: string };
  if (!res.ok || !data.id || !data.url) throw new Error(data.error ?? 'Yuklab bo‘lmadi.');
  return { id: data.id, url: data.url, label: data.label ?? '' };
}

/** Bir nechta faylni ketma-ket yuklaydi va holatni qaytaradi. */
function useUploader() {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (files: File[]): Promise<Uploaded[]> => {
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (!images.length) return [];
    setError(null);
    setBusy((n) => n + images.length);
    const done: Uploaded[] = [];
    for (const file of images) {
      try {
        done.push(await uploadImage(file));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy((n) => n - 1);
      }
    }
    return done;
  }, []);

  return { run, busy, error };
}

/* ------------------------------------------------------------- drop zone -- */

function Zone({
  onFiles,
  busy,
  multiple,
  children,
  label,
}: {
  onFiles: (files: File[]) => void;
  busy: number;
  multiple?: boolean;
  children?: React.ReactNode;
  label: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFiles([...e.dataTransfer.files]);
      }}
      onPaste={(e) => {
        const files = [...e.clipboardData.files];
        if (files.length) {
          e.preventDefault();
          onFiles(files);
        }
      }}
      className={`flex flex-col items-center justify-center gap-2 rounded-card border border-dashed p-6 text-center transition-colors ${
        over ? 'border-obsidian bg-mist/20' : 'border-mist'
      }`}
    >
      {children}
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple={multiple}
        // Bu input formaning bir qismi emas — `name` yo'q, shuning uchun
        // FormData'ga tushmaydi va faylni server action'ga olib ketmaydi.
        className="hidden"
        onChange={(e) => {
          onFiles([...(e.target.files ?? [])]);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="text-body underline underline-offset-4 transition-colors hover:text-pebble"
      >
        {busy > 0 ? `Yuklanyapti… (${busy})` : label}
      </button>
      <p className="text-body-sm text-driftwood">
        Bu yerga sudrab tashlang yoki nusxadan qo‘ying (Cmd+V)
      </p>
    </div>
  );
}

/* ---------------------------------------------------------- bitta rasm -- */

export function ImageDrop({
  label,
  hint,
  name,
  defaultValue,
  options,
  required,
}: {
  label: string;
  hint?: string;
  name: string;
  defaultValue?: number | null;
  /** Ilgari yuklanganlar — "tanlash" yo'li yo'qolmasin. */
  options: MediaOption[];
  required?: boolean;
}) {
  const known = options.find((o) => o.id === defaultValue) ?? null;
  const [picked, setPicked] = useState<Uploaded | null>(known);
  const [choosing, setChoosing] = useState(false);
  const { run, busy, error } = useUploader();

  const onFiles = async (files: File[]) => {
    const [first] = await run(files.slice(0, 1));
    if (first) setPicked(first);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="flex flex-col gap-1">
        <span className="text-body">
          {label}
          {required && <span className="text-pebble"> *</span>}
        </span>
        {hint && <span className="text-body-sm text-driftwood">{hint}</span>}
      </span>

      <input type="hidden" name={name} value={picked?.id ?? ''} />

      {picked ? (
        <div className="flex flex-col gap-3 rounded-card border border-mist p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={picked.url} alt="" className="max-h-64 w-full rounded-card object-cover" />
          <AltField media={picked} onChange={(alt) => setPicked({ ...picked, label: alt })} />
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="text-body-sm text-pebble underline underline-offset-4 hover:text-obsidian"
            >
              Boshqasini qo‘yish
            </button>
          </div>
        </div>
      ) : (
        <>
          <Zone onFiles={onFiles} busy={busy} label="Rasm tanlash">
            {null}
          </Zone>
          {options.length > 0 && (
            <button
              type="button"
              onClick={() => setChoosing((v) => !v)}
              className="self-start text-body-sm text-pebble underline underline-offset-4 hover:text-obsidian"
            >
              {choosing ? 'Yopish' : 'Yoki ilgari yuklanganlardan tanlash'}
            </button>
          )}
          {choosing && (
            <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto rounded-card border border-mist p-2">
              {options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  title={o.label}
                  onClick={() => {
                    setPicked(o);
                    setChoosing(false);
                  }}
                  className="overflow-hidden rounded-card border border-mist transition-colors hover:border-obsidian"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.url} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {error && <p className="text-body-sm text-ember">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------- rasmlar to'plami -- */

export function ImageStack({
  label,
  hint,
  name,
  defaultValue,
  options,
}: {
  label: string;
  hint?: string;
  /** Har bir rasm `name.0`, `name.1`, … bo'lib boradi. */
  name: string;
  defaultValue: number[];
  options: MediaOption[];
}) {
  const initial = defaultValue
    .map((id) => options.find((o) => o.id === id))
    .filter((o): o is MediaOption => Boolean(o));

  const [items, setItems] = useState<Uploaded[]>(initial);
  const { run, busy, error } = useUploader();

  const onFiles = async (files: File[]) => {
    const added = await run(files);
    if (added.length) setItems((prev) => [...prev, ...added]);
  };

  const move = (i: number, delta: number) =>
    setItems((prev) => {
      const to = i + delta;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[to]] = [next[to], next[i]];
      return next;
    });

  return (
    <div className="flex flex-col gap-2">
      <span className="flex flex-col gap-1">
        <span className="text-body">{label}</span>
        {hint && <span className="text-body-sm text-driftwood">{hint}</span>}
      </span>

      {/* Slot emas, ro'yxat: nechta rasm bo'lishini forma emas, ish belgilaydi. */}
      {items.map((item, i) => (
        <input key={item.id} type="hidden" name={`${name}.${i}`} value={item.id} />
      ))}

      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, i) => (
            <li key={`${item.id}-${i}`} className="flex flex-col gap-2">
              <div className="relative overflow-hidden rounded-card border border-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="aspect-[4/3] w-full object-cover" />
                <span className="absolute top-2 left-2 rounded-pill bg-white/90 px-2 py-0.5 text-body-sm">
                  {i + 1}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Tiny label="Chapga" disabled={i === 0} onClick={() => move(i, -1)}>
                  ←
                </Tiny>
                <Tiny label="O‘ngga" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                  →
                </Tiny>
                <Tiny
                  label="Olib tashlash"
                  onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                >
                  ✕
                </Tiny>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Zone onFiles={onFiles} busy={busy} multiple label="Rasmlar tanlash" />

      {options.length > 0 && (
        <details className="rounded-card border border-mist">
          <summary className="cursor-pointer list-none p-3 text-body-sm text-pebble">
            Yoki ilgari yuklanganlardan qo‘shish
          </summary>
          <div className="grid max-h-64 grid-cols-5 gap-2 overflow-y-auto p-3 pt-0">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                title={o.label}
                onClick={() => setItems((prev) => [...prev, o])}
                className="overflow-hidden rounded-card border border-mist transition-colors hover:border-obsidian"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.url} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </details>
      )}

      {error && <p className="text-body-sm text-ember">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------- yordamchi -- */

/**
 * Rasm izohi (alt). Yuklashda so'ralmaydi — bu oqimni to'xtatadi — lekin
 * ko'rinib turadi va shu yerda tuzatiladi. Bo'sh qoldirilsa fayl nomi qoladi,
 * ya'ni skrinrider "IMG_2831" deb o'qiydi: yaxshi emas, lekin yuklashni
 * bloklagandan ko'ra yaxshiroq.
 */
function AltField({ media, onChange }: { media: Uploaded; onChange: (alt: string) => void }) {
  const [value, setValue] = useState(media.label);
  const [saved, setSaved] = useState(false);

  return (
    <label className="flex flex-col gap-1">
      <span className="text-body-sm text-driftwood">
        Rasm nimani ko‘rsatadi? {saved && <span className="text-pebble">Saqlandi.</span>}
      </span>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        onBlur={async () => {
          const alt = value.trim();
          if (!alt || alt === media.label) return;
          await fetch('/api/panel/upload', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: media.id, alt }),
          });
          onChange(alt);
          setSaved(true);
        }}
        className="min-h-11 w-full rounded-pill border border-mist bg-white px-4 text-body outline-none transition-colors hover:border-pebble focus:border-obsidian"
      />
    </label>
  );
}

function Tiny({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-pill border border-mist bg-white text-body-sm text-pebble transition-colors hover:border-obsidian hover:text-obsidian disabled:border-mist/60 disabled:text-mist"
    >
      {children}
    </button>
  );
}
