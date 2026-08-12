'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useId, useRef, useState, type ReactNode } from 'react';
import { DEFAULT_LOCALE, PANEL_LOCALES, type PanelLocale } from '@/panel/locale';
import { ImageDrop } from '@/panel/ImageDrop';
import type { MediaOption } from '@/panel/media';

/**
 * The panel's kit. Same tokens as the site (`globals.css`), same shapes: mist
 * hairlines, pill controls, obsidian text on white, no shadows and no
 * elevation.
 *
 * Two deliberate departures from the site's rules, both because this is a tool
 * rather than a page:
 *
 * 1. **Save is a filled obsidian pill.** The site has no primary CTA colour and
 *    every button is an outline that inverts on hover. In a form the one action
 *    that commits work cannot be the same weight as "Bekor qilish" — this is the
 *    site's own hover state made permanent, not a new colour.
 * 2. **Type runs at body-sm.** The site's floor is 16px and that holds here, but
 *    a form with forty labels set at reading size is a wall; the labels carry
 *    the smaller leading, the values do not.
 *
 * Everything is labelled in Uzbek and in plain words. No field on any screen
 * says "slug", "locale", "collection" or "rich text" — where the data model
 * needs one of those, the label describes what it does and the value is derived
 * (see `slugify` in `panel/format.ts`).
 */

/* ------------------------------------------------------------- controls -- */

const CONTROL =
  'w-full border bg-white px-5 text-body outline-none transition-colors placeholder:text-driftwood border-mist hover:border-pebble focus:border-obsidian';

export function Field({
  label,
  hint,
  name,
  defaultValue = '',
  placeholder,
  required,
  type = 'text',
  autoComplete,
}: {
  label: string;
  hint?: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'number' | 'date' | 'email' | 'password' | 'tel';
  /** Only worth passing on the password screens, so a manager offers the right entry. */
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} label={label} hint={hint} required={required} />
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${CONTROL} min-h-14 rounded-pill`}
      />
    </div>
  );
}

export function Area({
  label,
  hint,
  name,
  defaultValue = '',
  placeholder,
  required,
  rows = 4,
}: {
  label: string;
  hint?: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} label={label} hint={hint} required={required} />
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        // Not a pill: a multi-line box with 100px corners loses its top and
        // bottom lines of text into the curve.
        className={`${CONTROL} resize-y rounded-card py-4 leading-relaxed`}
      />
    </div>
  );
}

export function Toggle({
  label,
  hint,
  name,
  defaultChecked,
}: {
  label: string;
  hint?: string;
  name: string;
  defaultChecked?: boolean | null;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked ?? false}
        className="mt-1 size-5 shrink-0 accent-obsidian"
      />
      <span className="flex flex-col gap-1">
        <span className="text-body">{label}</span>
        {hint && <span className="text-body-sm text-driftwood">{hint}</span>}
      </span>
    </label>
  );
}

export function Choice({
  label,
  hint,
  name,
  options,
  defaultValue,
}: {
  label: string;
  hint?: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} label={label} hint={hint} />
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? options[0]?.value}
        className={`${CONTROL} min-h-14 appearance-none rounded-pill`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Label({
  htmlFor,
  label,
  hint,
  required,
}: {
  htmlFor: string;
  label: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1">
      <span className="text-body">
        {label}
        {/* Not ember — that colour is the error state, site-wide rule 6. */}
        {required && <span className="text-pebble"> *</span>}
      </span>
      {hint && <span className="text-body-sm text-driftwood">{hint}</span>}
    </label>
  );
}

/* --------------------------------------------------------------- layout -- */

/**
 * The top of every screen: what this is, one line about it, and the one action
 * that belongs to it. Written once because seven screens had seven slightly
 * different header stacks — different gaps, different button sizes — and the
 * inconsistency read as unfinished long before any single one of them did.
 */
export function PageHeader({
  title,
  lead,
  action,
  back,
}: {
  title: string;
  lead?: string;
  action?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-6 border-b border-mist pb-8">
      {back}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-heading lg:text-heading-lg">{title}</h1>
          {lead && <p className="max-w-[70ch] text-body text-pebble">{lead}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}

/** The filled obsidian pill. Reserved for the one action a screen is *for*. */
export function ActionButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-13 items-center rounded-pill bg-obsidian px-7 text-body text-white transition duration-200 ease-fluid hover:bg-pebble active:scale-[0.97] active:duration-100"
    >
      {children}
    </Link>
  );
}

/**
 * Nothing here yet. A bordered box with one grey sentence in it reads as a bug;
 * this reads as a state, and it says what will put something in it.
 */
export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-mist px-6 py-20 text-center">
      <p className="text-body-lg">{title}</p>
      {hint && <p className="max-w-[52ch] text-body text-pebble">{hint}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function Card({ title, hint, children }: { title?: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 rounded-card border border-mist p-6 lg:p-8">
      {title && (
        <header className="flex flex-col gap-1">
          <h2 className="text-heading-sm">{title}</h2>
          {hint && <p className="max-w-[60ch] text-body-sm text-pebble">{hint}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

/** The back link at the top of every editor. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-2 text-body-sm text-pebble transition-colors hover:text-obsidian"
    >
      ← {children}
    </Link>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 md:grid-cols-2">{children}</div>;
}

/**
 * A borderless line of type that behaves like a heading rather than a field.
 * Used for the one or two things at the top of an editor that *are* the
 * document — an article's title, a project's name. A boxed input there makes
 * the screen read as a form to fill in instead of a page to write.
 */
export function BigField({
  name,
  defaultValue = '',
  placeholder,
  required,
  size = 'title',
}: {
  name: string;
  defaultValue?: string | null;
  placeholder: string;
  required?: boolean;
  size?: 'title' | 'lead';
}) {
  return (
    <input
      name={name}
      required={required}
      defaultValue={defaultValue ?? ''}
      placeholder={placeholder}
      className={`w-full rounded-card border border-transparent bg-transparent px-4 py-2 outline-none transition-colors placeholder:text-driftwood hover:border-mist focus:border-mist ${
        size === 'title' ? 'text-heading lg:text-heading-lg' : 'text-body-lg text-pebble'
      }`}
    />
  );
}

/**
 * Everything that is not the writing. Closed by default and it stays closed:
 * a rubric and a publication date are set once and then never looked at again,
 * and putting them above the text is what made the old screen feel like paperwork.
 */
export function Collapse({
  title,
  hint,
  children,
  open = false,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="group rounded-card border border-mist">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 lg:p-8">
        <span className="flex flex-col gap-1">
          <span className="text-heading-sm">{title}</span>
          {hint && <span className="text-body-sm text-pebble">{hint}</span>}
        </span>
        <span className="text-body text-pebble transition-transform group-open:rotate-180">⌄</span>
      </summary>
      <div className="flex flex-col gap-6 px-6 pb-8 lg:px-8">{children}</div>
    </details>
  );
}

/* ------------------------------------------------------------ languages -- */

export const LANGS = [
  { code: 'ru', label: 'Ruscha' },
  { code: 'uz', label: 'O‘zbekcha' },
  { code: 'en', label: 'Inglizcha' },
] as const;

export type Lang = (typeof LANGS)[number]['code'];

/**
 * Three languages as tabs, all three **mounted at once** and hidden with CSS.
 *
 * That is the load-bearing decision here. Unmounting the inactive tabs would
 * drop their inputs out of the DOM, and an input that is not in the DOM is not
 * in the `FormData` — saving from the Russian tab would silently blank the
 * Uzbek and English copy of every field on the screen. `hidden` keeps them
 * submitted.
 */
export function LangTabs({ children }: { children: (lang: Lang) => ReactNode }) {
  const [active, setActive] = useState<Lang>('ru');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setActive(l.code)}
            aria-pressed={active === l.code}
            className={`rounded-pill border px-5 py-[9px] text-body-sm transition-colors ${
              active === l.code
                ? 'border-obsidian bg-obsidian text-white'
                : 'border-mist hover:border-obsidian'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {LANGS.map((l) => (
        <div key={l.code} hidden={active !== l.code} className="flex flex-col gap-6">
          {children(l.code)}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- actions -- */

/**
 * The bar that follows you down a long editor.
 *
 * Full-bleed to the edges of the main column and translucent, so the page keeps
 * running underneath it rather than ending in a white slab. `backdrop-filter`
 * is written unprefixed and once — Lightning CSS does the prefixing, and a
 * hand-written `-webkit-` copy replaces the standard property instead of
 * supplementing it, which silently drops the blur (the same trap the site's
 * header hit).
 */
export function SaveBar({
  children,
  note,
  label,
}: {
  children?: ReactNode;
  note?: string;
  label?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-4 flex flex-wrap items-center gap-4 border-t border-mist bg-white/85 px-4 py-5 backdrop-blur-md lg:-mx-12 lg:px-12">
      <SaveButton label={label} />
      {children}
      {note && (
        <span className="flex items-center gap-2 text-body-sm text-pebble">
          <span className="size-1.5 rounded-pill bg-obsidian" />
          {note}
        </span>
      )}
    </div>
  );
}

export function SaveButton({ label = 'Saqlash' }: { label?: string }) {
  return (
    <button
      type="submit"
      className="inline-flex min-h-13 items-center justify-center rounded-pill bg-obsidian px-8 text-body text-white transition duration-200 ease-fluid hover:bg-pebble active:scale-[0.97] active:duration-100"
    >
      {label}
    </button>
  );
}

export function GhostButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-14 items-center justify-center rounded-pill border border-mist px-6 text-body transition-colors hover:border-obsidian"
    >
      {children}
    </button>
  );
}

/* --------------------------------------------------------------- tillar -- */

/**
 * Ekranning tili. Havola, tugma emas — holat URL'da (`?til=ru`), ya'ni
 * sahifa yangilansa ham, havola ulashilsa ham saqlanadi va orqaga tugmasi
 * kutilganidek ishlaydi.
 *
 * Ogohlantirish matni ataylab: mijoz ruscha ekranda bo'sh maydonlarni
 * ko'rib "kontent yo'qoldi" deb o'ylamasin.
 */
export function LangSwitch({ locale, hint = true }: { locale: PanelLocale; hint?: boolean }) {
  const params = useSearchParams();
  const path = usePathname();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 self-start rounded-pill border border-mist p-1">
        {PANEL_LOCALES.map((l) => {
          const next = new URLSearchParams(params);
          if (l.code === DEFAULT_LOCALE) next.delete('til');
          else next.set('til', l.code);
          const qs = next.toString();
          return (
            <Link
              key={l.code}
              href={qs ? `${path}?${qs}` : path}
              aria-current={l.code === locale ? 'page' : undefined}
              className={`rounded-pill px-4 py-1.5 text-body-sm transition-colors ${
                l.code === locale ? 'bg-obsidian text-white' : 'text-pebble hover:text-obsidian'
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
      {hint && locale !== DEFAULT_LOCALE && (
        <p className="text-body-sm text-driftwood">
          Ruscha matn. Bo‘sh qoldirilgan maydon saytda o‘zbekchasini ko‘rsatadi — hech narsa
          yo‘qolmaydi.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------ qo'shiladigan qatorlar -- */

export type RowField = {
  key: string;
  label: string;
  placeholder?: string;
  /** Ustunning nisbiy kengligi (flex). */
  grow?: number;
  kind?: 'text' | 'area' | 'image';
};

/**
 * Soni oldindan noma'lum qatorlar: ijtimoiy tarmoqlar, raqamlar, qadriyatlar,
 * jamoa. Bugun to'rtta, ertaga beshta bo'lishi mumkin — qat'iy slot emas.
 * Bo'sh qolgan qator saqlashda tushib qoladi (`readRows`, `panel/form-map.ts`).
 *
 * **`key` indeks emas, o'sib boradigan raqam.** `Field` boshqarilmaydigan
 * input ustiga qurilgan: indeks bilan kalitlanganda o'rtadagi qator
 * o'chirilsa React DOM tugunini qayta ishlatardi, `defaultValue` esa qayta
 * qo'llanmaydi — ekranda o'chirilgan qatorning matni qolib ketardi.
 *
 * Ilgari bu `SettingsForm.tsx` ichida yashardi. Jamoa qatorlari uchun ham
 * kerak bo'ldi, va yuqoridagi kalit qoidasi jimgina buziladigan turdan —
 * ikkita nusxa bo'lgandan ko'ra bitta joyda tursin.
 */
export function RepeatRows({
  name,
  initial,
  fields,
  media = [],
  addLabel = '+ Yana bitta',
}: {
  name: string;
  initial: Record<string, string>[];
  fields: RowField[];
  /** `kind: 'image'` maydonlari uchun. */
  media?: MediaOption[];
  addLabel?: string;
}) {
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, '']));
  const [rows, setRows] = useState(() =>
    (initial.length ? initial : [blank()]).map((values, i) => ({ key: i, values })),
  );
  const nextKey = useRef(rows.length);
  const stacked = fields.some((f) => f.kind && f.kind !== 'text');

  return (
    <>
      {rows.map((row, i) => (
        <div
          key={row.key}
          className={
            stacked
              ? 'flex flex-col gap-4 rounded-card border border-mist p-4'
              : 'flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4'
          }
        >
          {/*
           * Payload'dagi qator id'si. Bu ko'rinmaydi, lekin **tarjimani
           * saqlab qoladigan yagona narsa**: massiv id'siz saqlansa Payload
           * qatorlarni qaytadan yaratadi va boshqa tildagi matn `null` bo'lib
           * ketadi (o'lchangan). Yangi qatorda bo'sh — Payload o'zi id beradi.
           */}
          <input type="hidden" name={`${name}.${i}.id`} value={row.values.id ?? ''} readOnly />
          {fields.map((f) => (
            <div key={f.key} style={stacked ? undefined : { flex: f.grow ?? 1 }}>
              {f.kind === 'image' ? (
                <ImageDrop
                  label={f.label}
                  name={`${name}.${i}.${f.key}`}
                  options={media}
                  defaultValue={Number(row.values[f.key]) || null}
                />
              ) : f.kind === 'area' ? (
                <Area
                  label={f.label}
                  name={`${name}.${i}.${f.key}`}
                  defaultValue={row.values[f.key] ?? ''}
                  placeholder={f.placeholder}
                  rows={3}
                />
              ) : (
                <Field
                  label={f.label}
                  name={`${name}.${i}.${f.key}`}
                  defaultValue={row.values[f.key] ?? ''}
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
            className={`min-h-14 shrink-0 rounded-pill border border-mist px-5 text-body-sm text-pebble transition-colors hover:border-obsidian hover:text-obsidian ${
              stacked ? 'self-start' : ''
            }`}
          >
            O‘chirish
          </button>
        </div>
      ))}
      <GhostButton
        onClick={() => setRows((prev) => [...prev, { key: nextKey.current++, values: blank() }])}
      >
        {addLabel}
      </GhostButton>
    </>
  );
}
