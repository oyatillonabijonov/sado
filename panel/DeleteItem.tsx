'use client';

import { useState } from 'react';
import type { CollectionSlug } from 'payload';
import { deleteItem } from '@/panel/collection-actions';

/**
 * Its own `<form>`, deliberately outside the editor's — a form inside a form is
 * invalid HTML and the browser drops the inner one, so this button would
 * silently submit the save action instead.
 *
 * Two steps rather than a `confirm()` dialog: the second button is a real,
 * focusable control that names what it is about to delete.
 */
export function DeleteItem({
  collection,
  id,
  name,
  backTo,
  label = 'O‘chirish',
}: {
  collection: CollectionSlug;
  id: number;
  name: string;
  backTo: string;
  label?: string;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="self-start text-body-sm text-pebble underline underline-offset-4 hover:text-ember"
      >
        {label}
      </button>
    );
  }

  return (
    <form
      action={deleteItem.bind(null, collection, id, backTo)}
      className="flex flex-wrap items-center gap-4"
    >
      <span className="text-body">«{name}» butunlay o‘chiriladi. Qaytarib bo‘lmaydi.</span>
      <button
        type="submit"
        className="inline-flex min-h-12 items-center rounded-pill border border-ember px-6 text-body text-ember transition-colors hover:bg-ember hover:text-white"
      >
        Ha, o‘chirilsin
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="text-body-sm text-pebble underline underline-offset-4 hover:text-obsidian"
      >
        Bekor qilish
      </button>
    </form>
  );
}
