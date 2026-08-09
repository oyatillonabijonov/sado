import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Файл', plural: 'Медиа' },
  admin: { group: 'Контент' },
  access: { read: () => true },
  upload: {
    // Original ham chegaralanadi: mijoz kameradan chiqqan 8 MB'lik faylni
    // yuklaganda u diskda ham, `next/image` kirishida ham o'shancha qolib
    // ketardi. 2400px — hero to'liq ekran uchun yetarli.
    // Sxemaga tegmaydi (faqat sharp resize) — schema.sqlite qayta kerak emas.
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    // Ratios the design fixes: 4:3 cards, 16:9 heroes, 16:10 works list, 3:4 portraits.
    imageSizes: [
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'wide', width: 1600, height: 900, position: 'centre' },
      { name: 'works', width: 1200, height: 750, position: 'centre' },
      { name: 'portrait', width: 600, height: 800, position: 'centre' },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Альтернативный текст — обязателен для доступности.' },
    },
  ],
};
