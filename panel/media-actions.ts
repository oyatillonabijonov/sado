'use server';

import { revalidatePath } from 'next/cache';
import { payloadClient, requireUser } from '@/panel/auth';
import type { FormState } from '@/panel/form-state';

/** 8 MB. Above this a photograph belongs in an image editor first, not here. */
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];

/** Video — loyiha galereyasi uchun. `app/api/panel/upload` bilan bir xil chegara. */
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const VIDEO = ['video/mp4', 'video/webm'];

export async function uploadMedia(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser();

  const file = fd.get('file');
  const alt = String(fd.get('alt') ?? '').trim();

  if (!(file instanceof File) || file.size === 0) return { error: 'Fayl tanlanmadi.' };
  if (!alt) return { error: 'Rasm nimani ko‘rsatishini yozing — ko‘rmaydigan odamlar uchun kerak.' };
  if (!IMAGE.includes(file.type) && !VIDEO.includes(file.type)) {
    return { error: 'Rasm (JPG, PNG, WebP, AVIF, SVG) yoki video (MP4, WebM) yuklang.' };
  }
  const limit = VIDEO.includes(file.type) ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    return {
      error:
        `Fayl juda katta (${Math.round(file.size / 1024 / 1024)} MB). ` +
        `${Math.round(limit / 1024 / 1024)} MB gacha bo‘lsin.`,
    };
  }

  const payload = await payloadClient();
  try {
    await payload.create({
      collection: 'media',
      data: { alt },
      // Payload does the resizing itself (`Media.imageSizes`), so the original
      // goes in untouched and every derived size follows from the collection.
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    });
  } catch (error) {
    return { error: `Yuklab bo‘lmadi: ${error instanceof Error ? error.message : String(error)}` };
  }

  revalidatePath('/panel/rasmlar');
  return { ok: true };
}

/**
 * Deleting a picture that a case or an article still points at would leave a
 * hole on the live site, so the reference count is checked first.
 */
export async function deleteMedia(id: number): Promise<FormState> {
  await requireUser();
  const payload = await payloadClient();

  // Yangi kolleksiya qo'shganda uning rasm maydonini shu ro'yxatga qo'shing.
  const uses = await Promise.all([
    payload.count({ collection: 'projects', where: { cover: { equals: id } } }),
    payload.count({ collection: 'projects', where: { gallery: { equals: id } } }),
    payload.count({ collection: 'posts', where: { cover: { equals: id } } }),
  ]);

  const total = uses.reduce((sum, u) => sum + u.totalDocs, 0);
  if (total > 0) {
    return {
      error: `Bu rasm ${total} ta joyda ishlatilyapti. Avval o‘sha joylardan boshqa rasmga almashtiring.`,
    };
  }

  await payload.delete({ collection: 'media', id });
  revalidatePath('/panel/rasmlar');
  return { ok: true };
}
