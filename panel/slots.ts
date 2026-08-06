/**
 * How many slots each repeating block renders. Empty ones are dropped on save.
 *
 * These live in a module of their own, with **neither** `'use server'` nor
 * `'server-only'` on it, and that is not tidiness — it is the only place they
 * can be. A client form and a server action both need the numbers:
 *
 * - `'use server'` modules may only export async functions, so a `const` cannot
 *   sit in the actions file;
 * - importing a value (as opposed to a `type`) out of a `'server-only'` module
 *   pulls that module's whole graph — here, Payload and the SQLite driver —
 *   into the client bundle, which fails the build with a `node:fs` error a long
 *   way from the actual import.
 */

export const SLOTS = { constraints: 6, metrics: 3, decisions: 3, gallery: 6 } as const;

/** Services show exactly three outcomes; the collection enforces min = max = 3. */
export const OUTCOME_SLOTS = 3;

/** Frames in the home page's hero slideshow. */
export const HERO_SLOTS = 4;
