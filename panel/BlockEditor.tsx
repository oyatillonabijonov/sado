'use client';

import { useEffect, useRef, useState } from 'react';
import type { Block } from '@/panel/lexical';
import type { MediaOption } from '@/panel/MediaPicker';

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
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

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
      rows={2}
      // Borderless on purpose: a page of boxed fields reads as a form, and this
      // is meant to read as a page being written. The mist line only appears
      // when the block is being worked on.
      className="w-full resize-none rounded-card border border-transparent bg-transparent px-4 py-3 text-body-lg leading-relaxed outline-none transition-colors placeholder:text-driftwood hover:border-mist focus:border-mist"
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
  const selected = media.find((m) => m.id === value);

  return (
    <div className="flex flex-col gap-3 rounded-card border border-mist p-4">
      {selected ? (
        <figure className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selected.url} alt={selected.label} className="w-full rounded-card" />
          <figcaption className="text-body-sm text-driftwood">
            Sayt ostiga shu matnni yozadi: “{selected.label}”
          </figcaption>
        </figure>
      ) : (
        <p className="text-body-sm text-driftwood">Rasm tanlanmagan.</p>
      )}

      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="min-h-12 w-full appearance-none rounded-pill border border-mist bg-white px-5 text-body outline-none transition-colors hover:border-pebble focus:border-obsidian"
      >
        <option value="">Rasm tanlang</option>
        {media.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
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
