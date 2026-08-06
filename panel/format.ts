import 'server-only';

/**
 * Small shared helpers for the panel. Everything the studio should never have
 * to think about lives here — the shape of a URL segment, how a date reads, how
 * a phone number becomes a link.
 */

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y',
  ь: '', э: 'e', ю: 'yu', я: 'ya',
  ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h',
};

/**
 * The URL segment, derived rather than asked for.
 *
 * This is the single biggest piece of jargon the old panel put in front of the
 * studio: "slug", a required field, in English, with no explanation of what
 * breaks if you change it. Here it is computed from the name, shown read-only
 * as part of the finished address, and only editable behind an explicit
 * "manzilni o‘zgartirish" toggle.
 *
 * Cyrillic is transliterated rather than stripped — a Russian client name would
 * otherwise reduce to an empty string and every case would collide on ''.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** `2026-08-04T09:12:00Z` → `4 avgust, 12:17`. */
const MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

export function formatDate(value: string | Date | null | undefined, withTime = true): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  if (!withTime) return date;
  return `${date}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Everything that is not a digit or a leading + goes, so `tel:` always works. */
export function telHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `tel:${cleaned.startsWith('+') ? cleaned : `+${cleaned}`}`;
}

export const LANG_LABEL: Record<string, string> = {
  ru: 'Ruscha',
  uz: 'O‘zbekcha',
  en: 'Inglizcha',
};
