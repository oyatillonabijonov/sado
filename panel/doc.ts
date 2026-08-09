import 'server-only';
import type { CollectionSlug } from 'payload';
import { payloadClient } from '@/panel/auth';
import { toText } from '@/panel/lexical';
import type { MediaOption } from '@/panel/media';

/**
 * The four readers every screen's loader needs.
 *
 * A document fetched with `locale: 'all'` hands back each localized value as
 * `{ ru, uz, en }` — including values nested inside array rows — and relationships
 * as either an id or a populated object depending on `depth`. Unwrapping that at
 * the point of use would put a conditional next to every field in every form;
 * these do it once so the forms stay flat.
 */

export type LocValue = Record<string, unknown> | string | number | null | undefined;

/** One language out of a `{ ru, uz, en }` value, or the value itself if it is not localized. */
export function at(value: LocValue, lang: string): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  const v = (value as Record<string, unknown>)[lang];
  return v == null ? '' : String(v);
}

/** A relationship, whether it came back as an id or as a populated document. */
export function relId(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'id' in value) return Number((value as { id: number }).id);
  return null;
}

export function relIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map(relId).filter((v): v is number => v !== null);
}

/** Grow (or trim) a stored array to the fixed number of slots a form renders. */
export function pad<T>(rows: T[], count: number, empty: T): T[] {
  return Array.from({ length: count }, (_, i) => rows[i] ?? empty);
}

/**
 * A rich text field as plain text, plus whether anything was lost on the way.
 * The flag is collected per document rather than per field: one unrepresentable
 * block anywhere is enough to stop the whole form from saving.
 */
export function makeRichReader() {
  let lossy = false;
  const read = (value: LocValue, lang: string) => {
    const raw = value && typeof value === 'object' ? (value as Record<string, unknown>)[lang] : value;
    const result = toText(raw);
    if (result.lossy) lossy = true;
    return result.text;
  };
  return { read, get lossy() { return lossy; } };
}

/** `locale: 'all'`, `depth: 0`, `null` instead of a throw when the id is wrong. */
export async function findRaw(collection: CollectionSlug, id: number) {
  const payload = await payloadClient();
  const doc = await payload
    .findByID({ collection, id, locale: 'all', depth: 0 })
    .catch(() => null);
  return doc as unknown as Record<string, unknown> | null;
}

/** Next free position, so a newly created row lands at the end of its list. */
export async function nextOrder(collection: CollectionSlug) {
  const payload = await payloadClient();
  const { totalDocs } = await payload.count({ collection });
  return totalDocs;
}

/** Every uploaded picture, newest first — what the pickers choose from. */
export async function mediaOptions(): Promise<MediaOption[]> {
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection: 'media', limit: 300, sort: '-createdAt' });
  return docs
    .filter((d) => typeof d.url === 'string')
    .map((d) => ({
      id: d.id as number,
      label: (d.alt as string) || (d.filename as string) || `#${d.id}`,
      url: d.url as string,
    }));
}
