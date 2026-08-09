'use client';

import { useEffect, useRef, useState } from 'react';
import { uploadImage } from '@/panel/ImageDrop';
import type { Block } from '@/panel/lexical';
import type { MediaOption } from '@/panel/media';

/**
 * Writing, the way a post is written: a stack of blocks you add to as you go.
 *
 * The first version of this was one big textarea and it was the thing the
 * studio pushed back on hardest — a picture could only ever go above or below
 * the whole article, never after the third paragraph. So the document is a
 * list: a run of text, a picture, another run of text. "+ Rasm" between any two
 * blocks is the entire feature.
 *
 * **No contenteditable, and no editor library.** A `<textarea>` per text block
 * gets native undo, native spellcheck, native mobile keyboards and native
 * select-all for free, and cannot produce the invalid markup a rich text
 * surface does when someone pastes from Word. The five text marks (`##`, `-`,
 * `>`, …) are handled by the converter, not by this component.
 *
 * State lives here and is mirrored into one hidden input as JSON, because a
 * server action reads `FormData` and `FormData` has no idea what a block is.
 */
export function BlockEditor({
  name,
  initial,
  media,
  placeholder = 'Matnni shu yerga yozing…',
}: {
  name: string;
  initial: Block[];
  media: MediaOption[];
  placeholder?: string;
}) {
  // An empty document still needs somewhere to type.
  const [blocks, setBlocks] = useState<Block[]>(
    initial.length ? initial : [{ kind: 'text', text: '' }],
  );

  const update = (i: number, block: Block) =>
    setBlocks((b) => b.map((old, j) => (j === i ? block : old)));

  const insert = (i: number, block: Block) =>
    setBlocks((b) => [...b.slice(0, i), block, ...b.slice(i)]);

  const remove = (i: number) =>
    setBlocks((b) => (b.length === 1 ? [{ kind: 'text', text: '' }] : b.filter((_, j) => j !== i)));

  const move = (i: number, delta: number) =>
    setBlocks((b) => {
      const to = i + delta;
      if (to < 0 || to >= b.length) return b;
      const next = [...b];
      [next[i], next[to]] = [next[to], next[i]];
      return next;
    });

  return (
    <div className="flex flex-col">
      <input type="hidden" name={name} value={JSON.stringify(blocks)} />

      <Inserter onAdd={(block) => insert(0, block)} />

      {blocks.map((block, i) => (
        <div key={i} className="flex flex-col">
          <div className="group relative">
            {block.kind === 'text' ? (
              <TextBlock
                value={block.text}
                placeholder={i === 0 ? placeholder : 'Davomi…'}
                onChange={(text) => update(i, { kind: 'text', text })}
                onImage={(id) => insert(i + 1, { kind: 'image', media: id })}
              />
            ) : (
              <ImageBlock
                value={block.media}
                media={media}
                onChange={(id) => update(i, { kind: 'image', media: id })}
              />
            )}

            {/* Controls sit outside the block on wide screens and above it on
                narrow ones, so they never cover the first line of text. */}
            <div className="flex justify-end gap-1 pt-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 lg:absolute lg:top-0 lg:-right-12 lg:flex-col lg:pt-0">
              <Tiny label="Yuqoriga" onClick={() => move(i, -1)} disabled={i === 0}>
                ↑
              </Tiny>
              <Tiny label="Pastga" onClick={() => move(i, 1)} disabled={i === blocks.length - 1}>
                ↓
              </Tiny>
              <Tiny label="O‘chirish" onClick={() => remove(i)}>
                ✕
              </Tiny>
            </div>
          </div>

          <Inserter onAdd={(newBlock) => insert(i + 1, newBlock)} />
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- parts -- */

/**
 * A textarea that grows with its content. An editor that scrolls inside a fixed
 * box hides what you just wrote, which is the single most jarring thing about
 * writing long text in a CMS.
 */
function TextBlock({
  value,
  placeholder,
  onChange,
  onImage,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  /** Matnga rasm qo'yilsa — shu blokdan keyin yangi rasm bloki. */
  onImage: (id: number) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [dropping, setDropping] = useState(false);

  // Yozayotganda rasmni shu yerning o'ziga tashlash yoki Cmd+V bilan qo'yish —
  // "Rasmlar" ekraniga borib kelish shart emas.
  const take = async (files: FileList | null) => {
    const image = [...(files ?? [])].find((f) => f.type.startsWith('image/'));
    if (!image) return false;
    setDropping(true);
    try {
      onImage((await uploadImage(image)).id);
    } finally {
      setDropping(false);
    }
    return true;
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reset before measuring: `scrollHeight` never shrinks on its own.
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onPaste={(e) => {
        if (e.clipboardData.files.length) {
          e.preventDefault();
          void take(e.clipboardData.files);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        if (e.dataTransfer.files.length) {
          e.preventDefault();
          void take(e.dataTransfer.files);
        }
      }}
      rows={2}
      // Borderless on purpose: a page of boxed fields reads as a form, and this
      // is meant to read as a page being written. The mist line only appears
      // when the block is being worked on.
      className={`w-full resize-none rounded-card border bg-transparent px-4 py-3 text-body-lg leading-relaxed outline-none transition-colors placeholder:text-driftwood hover:border-mist focus:border-mist ${
        dropping ? 'border-obsidian' : 'border-transparent'
      }`}
    />
  );
}

function ImageBlock({
  value,
  media,
  onChange,
}: {
  value: number | null;
  media: MediaOption[];
  onChange: (id: number | null) => void;
}) {
  const known = media.find((m) => m.id === value) ?? null;
  const [shown, setShown] = useState<MediaOption | null>(known);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const take = async (files: FileList | null) => {
    const image = [...(files ?? [])].find((f) => f.type.startsWith('image/'));
    if (!image) return;
    setBusy(true);
    setError(null);
    try {
      const up = await uploadImage(image);
      setShown(up);
      onChange(up.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (shown) {
    return (
      <figure className="flex flex-col gap-2 rounded-card border border-mist p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shown.url} alt="" className="w-full rounded-card" />
        <figcaption className="text-body-sm text-driftwood">
          Sayt ostiga shu matnni yozadi: “{shown.label}”
        </figcaption>
        <button
          type="button"
          onClick={() => {
            setShown(null);
            onChange(null);
          }}
          className="self-start text-body-sm text-pebble underline underline-offset-4 hover:text-obsidian"
        >
          Boshqasini qo‘yish
        </button>
      </figure>
    );
  }

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
        void take(e.dataTransfer.files);
      }}
      onPaste={(e) => {
        if (e.clipboardData.files.length) {
          e.preventDefault();
          void take(e.clipboardData.files);
        }
      }}
      className={`flex flex-col items-center gap-2 rounded-card border border-dashed p-6 text-center transition-colors ${
        over ? 'border-obsidian bg-mist/20' : 'border-mist'
      }`}
    >
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void take(e.target.files);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="text-body underline underline-offset-4 hover:text-pebble"
      >
        {busy ? 'Yuklanyapti…' : 'Rasm tanlash'}
      </button>
      <p className="text-body-sm text-driftwood">Sudrab tashlang yoki Cmd+V</p>

      {media.length > 0 && (
        <button
          type="button"
          onClick={() => setChoosing((v) => !v)}
          className="text-body-sm text-pebble underline underline-offset-4 hover:text-obsidian"
        >
          {choosing ? 'Yopish' : 'Yoki yuklanganlardan tanlash'}
        </button>
      )}
      {choosing && (
        <div className="grid max-h-48 w-full grid-cols-5 gap-2 overflow-y-auto pt-2">
          {media.map((m) => (
            <button
              key={m.id}
              type="button"
              title={m.label}
              onClick={() => {
                setShown(m);
                onChange(m.id);
              }}
              className="overflow-hidden rounded-card border border-mist hover:border-obsidian"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt="" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-body-sm text-ember">{error}</p>}
    </div>
  );
}

/**
 * The gap between two blocks. Invisible until approached, which keeps a long
 * article from turning into a ladder of buttons.
 */
function Inserter({ onAdd }: { onAdd: (block: Block) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="group/ins relative flex h-8 items-center justify-center"
      onMouseLeave={() => setOpen(false)}
    >
      <span className="absolute inset-x-0 h-px bg-mist opacity-0 transition-opacity group-hover/ins:opacity-100" />
      {open ? (
        <div className="relative flex gap-2 bg-white px-2">
          <Chip onClick={() => { onAdd({ kind: 'text', text: '' }); setOpen(false); }}>Matn</Chip>
          <Chip onClick={() => { onAdd({ kind: 'image', media: null }); setOpen(false); }}>Rasm</Chip>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Shu yerga qo‘shish"
          className="relative flex size-7 items-center justify-center rounded-pill border border-mist bg-white text-body-sm text-pebble opacity-0 transition hover:border-obsidian hover:text-obsidian group-hover/ins:opacity-100 focus-visible:opacity-100"
        >
          +
        </button>
      )}
    </div>
  );
}

function Chip({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-pill border border-mist px-4 py-1.5 text-body-sm transition-colors hover:border-obsidian"
    >
      + {children}
    </button>
  );
}

function Tiny({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-pill border border-mist bg-white text-body-sm text-pebble transition-colors hover:border-obsidian hover:text-obsidian disabled:border-mist disabled:text-mist"
    >
      {children}
    </button>
  );
}
