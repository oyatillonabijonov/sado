'use client';

import { useEffect, useRef, useState } from 'react';
import { uploadImage } from '@/panel/ImageDrop';
import { SYNTAX_HINT, type Block } from '@/panel/lexical';
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
  /**
   * Bloklar **barqaror kalit** bilan yuritiladi, indeks bilan emas.
   *
   * `TextBlock` ichidagi `<textarea>` boshqarilmaydigan (`defaultValue`) —
   * Cmd+Z shu sababdan ishlaydi. Buning narxi shu: indeks bilan
   * kalitlanganda o'rtadagi blok o'chirilsa yoki bloklar joyi
   * almashtirilsa React DOM tugunini qayta ishlatardi, `defaultValue` esa
   * qayta qo'llanmaydi — ekranda ko'chirilgan blokning eski matni qolib
   * ketardi. Ikkalasi birga bo'lishi shart. `panel/ui.tsx` dagi
   * `RepeatRows` xuddi shu tuzoqni xuddi shunday hal qiladi.
   *
   * Kalit faqat React uchun: yashirin input'ga `rows` emas, `blocks`
   * yoziladi, ya'ni saqlanadigan JSON o'zgarmaydi (`parseBlocks` tegilmadi).
   */
  const nextKey = useRef(0);
  // An empty document still needs somewhere to type.
  const [rows, setRows] = useState<{ key: number; block: Block }[]>(() =>
    (initial.length ? initial : [{ kind: 'text', text: '' } as Block]).map((block) => ({
      key: nextKey.current++,
      block,
    })),
  );

  const update = (key: number, block: Block) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { key, block } : r)));

  const insert = (at: number, block: Block) =>
    setRows((rs) => [...rs.slice(0, at), { key: nextKey.current++, block }, ...rs.slice(at)]);

  const remove = (key: number) =>
    setRows((rs) =>
      // Oxirgi blok o'chirilsa yozadigan joy qolmaydi — o'rniga bo'sh blok,
      // lekin YANGI kalit bilan: eski kalit qolsa textarea qayta o'rnatilmay
      // o'chirilgan matnni ko'rsatib turardi.
      rs.length === 1
        ? [{ key: nextKey.current++, block: { kind: 'text', text: '' } }]
        : rs.filter((r) => r.key !== key),
    );

  const move = (at: number, delta: number) =>
    setRows((rs) => {
      const to = at + delta;
      if (to < 0 || to >= rs.length) return rs;
      const next = [...rs];
      [next[at], next[to]] = [next[to], next[at]];
      return next;
    });

  return (
    <div className="flex flex-col">
      <input type="hidden" name={name} value={JSON.stringify(rows.map((r) => r.block))} />

      <Inserter onAdd={(block) => insert(0, block)} />

      {rows.map(({ key, block }, i) => (
        <div key={key} className="flex flex-col">
          <div className="group relative">
            {block.kind === 'text' ? (
              <TextBlock
                value={block.text}
                placeholder={i === 0 ? placeholder : 'Davomi…'}
                onChange={(text) => update(key, { kind: 'text', text })}
                onImage={(id) => insert(i + 1, { kind: 'image', media: id })}
              />
            ) : (
              <ImageBlock
                value={block.media}
                media={media}
                onChange={(id) => update(key, { kind: 'image', media: id })}
              />
            )}

            {/* Controls sit outside the block on wide screens and above it on
                narrow ones, so they never cover the first line of text. */}
            <div className="flex justify-end gap-1 pt-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 lg:absolute lg:top-0 lg:-right-12 lg:flex-col lg:pt-0">
              <Tiny label="Yuqoriga" onClick={() => move(i, -1)} disabled={i === 0}>
                ↑
              </Tiny>
              <Tiny label="Pastga" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>
                ↓
              </Tiny>
              <Tiny label="O‘chirish" onClick={() => remove(key)}>
                ✕
              </Tiny>
            </div>
          </div>

          <Inserter onAdd={(newBlock) => insert(i + 1, newBlock)} />
        </div>
      ))}

      {/* Tugmalar sintaksisni o'zi qo'yadi, lekin xatboshi qoidasi faqat
          klaviaturada — uni aytib qo'yish kerak. */}
      <p className="px-2 pt-2 text-body-sm text-driftwood">{SYNTAX_HINT}</p>
    </div>
  );
}

/* ------------------------------------------------------------- toolbar -- */

/**
 * Formatlash tugmalari.
 *
 * Sintaksis (`## `, `> `, `**…**`) ilgari ham ishlardi, lekin uni **hech kim
 * bilmasdi**: ekranda hech qanday ishora yo'q edi va mijoz blogda faqat
 * yalang'och xatboshi yoza olardi. Tugmalar o'sha belgilarni qo'yadi —
 * muharrir hamon `<textarea>`, ya'ni imlo tekshiruvi, mobil klaviatura va
 * "hammasini belgilash" o'z holicha ishlaydi.
 *
 * `document.execCommand('insertText')` eskirgan deb belgilangan, lekin
 * matnni tanlov va kursor holati bilan birga almashtiradigan eng yaqin yo'l
 * shu; qo'llab-quvvatlanmagan joyda `setRangeText` ga tushamiz.
 *
 * **Cmd+Z bu muharrirda umuman ishlamaydi va bu tugmalarning aybi emas.**
 * `<textarea>` boshqariladigan (`value={value}`): React har renderda DOM
 * qiymatini qayta yozadi va brauzerning undo tarixi o'chadi — oddiy yozuvda
 * ham shunday. Tuzatish yo'li: textarea'ni boshqarilmaydigan qilish
 * (`defaultValue`) **va** bloklarga barqaror id berish, chunki hozir ular
 * indeks bilan kalitlangan (`key={i}`) va blok ko'chirilganda React DOM
 * tugunini qayta ishlatib eski matnni qoldirib ketardi — `RepeatRows` dagi
 * bilan bir xil tuzoq. Ikkalasi birga qilinmasa yozilgan matn yo'qoladi,
 * shuning uchun bu alohida ish.
 */
const BLOCK_MARK = /^(#{2,3}\s+|>\s+|-\s+|\d+\.\s+)/;

type Tool =
  | { label: string; title: string; kind: 'wrap'; mark: string; bold?: boolean; italic?: boolean }
  | { label: string; title: string; kind: 'prefix'; mark: string }
  | { label: React.ReactNode; title: string; kind: 'link' };

const TOOLS: Tool[] = [
  { label: 'H2', title: 'Sarlavha', kind: 'prefix', mark: '## ' },
  { label: 'H3', title: 'Kichik sarlavha', kind: 'prefix', mark: '### ' },
  { label: 'B', title: 'Qalin', kind: 'wrap', mark: '**', bold: true },
  { label: 'I', title: 'Kursiv', kind: 'wrap', mark: '*', italic: true },
  {
    label: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
        <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
        <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
      </svg>
    ),
    title: 'Havola',
    kind: 'link',
  },
  { label: '❝', title: 'Iqtibos', kind: 'prefix', mark: '> ' },
  { label: '•', title: "Ro'yxat", kind: 'prefix', mark: '- ' },
  { label: '1.', title: "Raqamli ro'yxat", kind: 'prefix', mark: '1. ' },
];

/** Tanlangan joyni almashtiradi va undo tarixini saqlaydi. */
function replace(el: HTMLTextAreaElement, start: number, end: number, value: string) {
  el.focus();
  el.setSelectionRange(start, end);
  if (!document.execCommand('insertText', false, value)) {
    el.setRangeText(value, start, end, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function apply(el: HTMLTextAreaElement, tool: Tool) {
  const { value, selectionStart: from, selectionEnd: to } = el;

  if (tool.kind === 'prefix') {
    // Qator boshidagi belgi butun qatorga tegishli — tanlov qayerda
    // turganidan qat'i nazar qatorning boshi topiladi.
    const start = value.lastIndexOf('\n', from - 1) + 1;
    const lineEnd = value.indexOf('\n', from);
    const line = value.slice(start, lineEnd === -1 ? value.length : lineEnd);
    const existing = line.match(BLOCK_MARK)?.[0] ?? '';
    const bare = line.slice(existing.length);
    // Xuddi shu belgi bo'lsa — o'chiriladi (tugma ikkilamchi holatga ega),
    // boshqa belgi bo'lsa — almashtiriladi, aks holda `## - matn` chiqardi.
    const next = existing === tool.mark ? bare : tool.mark + bare;
    replace(el, start, start + line.length, next);
    const shift = next.length - line.length;
    el.setSelectionRange(from + shift, to + shift);
    return;
  }

  const selected = value.slice(from, to);

  if (tool.kind === 'link') {
    const label = selected || 'matn';
    replace(el, from, to, `[${label}](https://)`);
    // Kursor URL'ning ichida qoladi — keyingi harakat manzilni yozish.
    const at = from + label.length + 3;
    el.setSelectionRange(at + 8, at + 8);
    return;
  }

  const m = tool.mark;
  // Allaqachon o'ralgan bo'lsa — yechiladi.
  if (selected.length > m.length * 2 && selected.startsWith(m) && selected.endsWith(m)) {
    const bare = selected.slice(m.length, -m.length);
    replace(el, from, to, bare);
    el.setSelectionRange(from, from + bare.length);
    return;
  }
  const label = selected || (tool.bold ? 'qalin matn' : 'kursiv matn');
  replace(el, from, to, `${m}${label}${m}`);
  el.setSelectionRange(from + m.length, from + m.length + label.length);
}

function Toolbar({ target }: { target: React.RefObject<HTMLTextAreaElement | null> }) {
  return (
    <div className="flex flex-wrap items-center gap-1 px-2 pb-1">
      {TOOLS.map((tool) => (
        <button
          key={tool.title}
          type="button"
          title={tool.title}
          aria-label={tool.title}
          // Tugmani bosish textarea'dan fokusni olib ketardi va tanlov
          // yo'qolardi — `mousedown` da to'xtatamiz.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => target.current && apply(target.current, tool)}
          className={`flex size-9 items-center justify-center rounded-card text-body-sm text-pebble transition-colors hover:bg-mist/40 hover:text-obsidian ${
            'bold' in tool && tool.bold ? 'font-semibold' : ''
          } ${'italic' in tool && tool.italic ? 'italic' : ''}`}
        >
          {tool.label}
        </button>
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
  // Panel faqat ishlanayotgan blokda: har bir blok ustida sakkizta tugma
  // tursa sahifa asboblar taxtasiga aylanardi, yozuvga esa joy qolmasdi.
  const [active, setActive] = useState(false);

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
    <div
      onFocus={() => setActive(true)}
      // Fokus panelning o'ziga o'tsa yopilmasin — `relatedTarget` shu
      // konteyner ichida bo'lsa blok hamon ishlanmoqda.
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(false);
      }}
    >
      {active && <Toolbar target={ref} />}
      <textarea
        ref={ref}
        // `defaultValue`, `value` emas — boshqariladigan textarea'da React
        // har renderda DOM qiymatini qayta yozadi va brauzerning undo
        // tarixi o'chadi: Cmd+Z oddiy yozuvda ham ishlamasdi. Holat
        // `onChange` orqali baribir yuqoriga chiqadi, DOM esa foydalanuvchi
        // nima yozgan bo'lsa o'shani ushlab turadi. Bu faqat bloklar
        // barqaror kalitli bo'lgani uchun xavfsiz (yuqoriga qarang).
        defaultValue={value}
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
    </div>
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
