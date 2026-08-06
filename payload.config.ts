import path from "node:path";
import { fileURLToPath } from "node:url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Media } from "@/collections/Media";
import { Posts } from "@/collections/Posts";
import { Projects } from "@/collections/Projects";
import { Services } from "@/collections/Services";
import { Users } from "@/collections/Users";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: { user: Users.slug },
  collections: [Users, Media, Projects, Services, Posts],
  editor: lexicalEditor(),
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
