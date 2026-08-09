import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Foydalanuvchi', plural: 'Foydalanuvchilar' },
  auth: {
    forgotPassword: {
      /**
       * Payload sukut bo'yicha `/admin/reset/<token>` ga havola yuboradi —
       * lekin bu loyihada Payload'ning o'z admin ekranlari generatsiya
       * qilinmagan, ya'ni o'sha havola 404 beradi. Havola bizning ekranga
       * boradi.
       */
      generateEmailHTML: (args) => {
        const token = (args as { token?: string } | undefined)?.token ?? '';
        const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005';
        const url = `${base}/panel/parol/yangilash?token=${token}`;
        return `
          <p>Salom,</p>
          <p>Boshqaruv paneli parolini tiklash so‘raldi. Yangi parol qo‘yish uchun:</p>
          <p><a href="${url}">${url}</a></p>
          <p>Agar bu siz bo‘lmasangiz, bu xatga e’tibor bermang — parol o‘zgarmaydi.</p>
        `;
      },
      generateEmailSubject: () => 'SADO — parolni tiklash',
    },
  },
  admin: { useAsTitle: 'email' },
  fields: [{ name: 'name', type: 'text' }],
};
