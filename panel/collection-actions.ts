'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { CollectionSlug } from 'payload';
import { payloadClient, requireUser } from '@/panel/auth';
import { reorder } from '@/panel/reorder';
import { PROJECT_SORT } from '@/data/projects';

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
  // Panel ro'yxati bilan AYNAN bir xil tartib — aks holda "yuqoriga" boshqa
  // qo'shni bilan almashardi. Loyihalar kamayish tartibida (yangisi tepada).
  const sort = collection === 'projects' ? PROJECT_SORT : 'order';
  const { docs } = await payload.find({ collection, limit: 200, sort, depth: 0 });

  const updates = reorder(
    docs.map((d) => ({ id: d.id as number, order: Number((d as { order?: unknown }).order ?? 0) })),
    id,
    direction,
    sort.startsWith('-'),
  );
  for (const u of updates) {
    await payload.update({ collection, id: u.id, data: { order: u.order } as never });
  }

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
