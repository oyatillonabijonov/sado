import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Файл', plural: 'Медиа' },
  admin: { group: 'Контент' },
  access: { read: () => true },
  upload: {
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
