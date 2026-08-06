'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { CollectionSlug } from 'payload';
import { payloadClient, requireUser } from '@/panel/auth';

/**
 * Move and delete, shared by every list in the panel.
 *
 * These two were written per-collection first and were the same fifteen lines
 * five times over. The *editors* stay hand-written — a generic form driven by
 * the field config is exactly the thing the studio asked to get away from, and
 * it is how a panel ends up with a "Slug" label again. Ordering and deletion
 * carry no copy, so there is nothing to lose by sharing them.
 */

export async function moveItem(collection: CollectionSlug, id: number, direction: 'up' | 'down') {
  await requireUser();
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection, limit: 200, sort: 'order', depth: 0 });

  const index = docs.findIndex((d) => d.id === id);
  const swapWith = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= docs.length) return;

  // Written from the array position rather than by swapping the two stored
  // values: seeded rows carry hand-set numbers and two of them can legitimately
  // be equal, in which case swapping the values moves nothing.
  await payload.update({ collection, id: docs[swapWith].id, data: { order: index } as never });
  await payload.update({ collection, id, data: { order: swapWith } as never });

  revalidatePath('/panel', 'layout');
  revalidatePath('/', 'layout');
}

export async function deleteItem(collection: CollectionSlug, id: number, backTo: string) {
  await requireUser();
  const payload = await payloadClient();
  await payload.delete({ collection, id });
  revalidatePath('/panel', 'layout');
  revalidatePath('/', 'layout');
  redirect(backTo);
}
