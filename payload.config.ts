import path from "node:path";
import { fileURLToPath } from "node:url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Media } from "@/collections/Media";
import { Posts } from "@/collections/Posts";
import { Projects } from "@/collections/Projects";
import { Services } from "@/collections/Services";
import { Users } from "@/collections/Users";
import { Settings } from "@/globals/Settings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: { user: Users.slug },
  collections: [Users, Media, Projects, Services, Posts],
  globals: [Settings],
  editor: lexicalEditor(),
  /**
   * Parol tiklash uchun pochta.
   *
   * SMTP sozlanmagan bo'lsa adapter xatga chiqarmaydi — Payload xatni server
   * konsoliga yozadi. Ya'ni oqim dev'da to'liq ishlaydi va productionda faqat
   * to'rtta env qiymati qo'yilishi kerak (.env.example ga qarang). Kalitsiz
   * jimgina "yuborildi" deb ko'rsatmaslik uchun holat login ekranida aytiladi.
   */
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || "no-reply@sado.uz",
        defaultFromName: "SADO",
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  secret: process.env.PAYLOAD_SECRET || "",
  // ponytail: fayl-baza — server ham, connection string ham kerak emas.
  // Vercel'ga chiqarilsa disk vaqtinchalik: DATABASE_URI ni Turso/Postgres'ga almashtiring.
  db: sqliteAdapter({ client: { url: process.env.DATABASE_URI || "file:./db.sqlite" } }),
  // ponytail: localization o'chirilgan — sayt bitta tilda chiqadi. Kerak bo'lganda
  // shu yerga `localization: { locales: ["uz","ru","en"], defaultLocale: "uz" }`
  // va maydonlarga `localized: true` qo'shiladi.
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
