import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getPayload } from "payload";
import config from "@payload-config";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { fromText } from "@/panel/lexical";

/**
 * Eski kontentni (data/*.ts va content/blog/*.mdx) Payload'ga bir marta ko'chiradi.
 *
 *   bun scripts/seed.ts
 *
 * Qayta ishga tushirsa bo'ladi: loyiha/xizmat/maqolalar slug bo'yicha
 * o'chirilib qayta yoziladi, rasmlar esa fayl nomi bo'yicha qayta ishlatiladi.
 */

const payload = await getPayload({ config });
const uploaded = new Map<string, number>();

/** `/images/projects/allsolar-1.jpg` → Media hujjatining id'si. */
async function media(publicPath: string, alt: string): Promise<number> {
  const cached = uploaded.get(publicPath);
  if (cached) return cached;

  const filename = path.basename(publicPath);
  const { docs } = await payload.find({
    collection: "media",
    limit: 1,
    where: { filename: { equals: filename } },
  });

  const id =
    (docs[0]?.id as number) ??
    ((
      await payload.create({
        collection: "media",
        data: { alt },
        filePath: path.join(process.cwd(), "public", publicPath),
      })
    ).id as number);

  uploaded.set(publicPath, id);
  return id;
}

async function wipe(collection: "projects" | "services" | "posts") {
  await payload.delete({ collection, where: { id: { greater_than: 0 } } });
}

/* ------------------------------------------------------------- loyihalar -- */

await wipe("projects");
for (const [order, p] of projects.entries()) {
  await payload.create({
    collection: "projects",
    data: {
      title: p.title,
      slug: p.slug,
      client: p.client,
      year: p.year,
      category: p.category,
      services: p.services,
      cover: await media(p.cover, p.title),
      featured: p.featured ?? false,
      brief: p.brief,
      solution: p.solution,
      results: p.results ?? [],
      gallery: await Promise.all(p.gallery.map((g) => media(g, p.title))),
      order,
    },
  });
  console.log(`loyiha: ${p.slug}`);
}

/* -------------------------------------------------------------- xizmatlar -- */

await wipe("services");
for (const [order, s] of services.entries()) {
  await payload.create({
    collection: "services",
    data: { ...s, order },
  });
  console.log(`xizmat: ${s.slug}`);
}

/* ------------------------------------------------------------- maqolalar -- */

await wipe("posts");
const blogDir = path.join(process.cwd(), "content/blog");
const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));

for (const [order, file] of files.entries()) {
  const { data, content } = matter(fs.readFileSync(path.join(blogDir, file), "utf8"));
  await payload.create({
    collection: "posts",
    data: {
      title: String(data.title),
      slug: file.replace(/\.mdx$/, ""),
      description: String(data.description),
      date: new Date(String(data.date)).toISOString(),
      category: String(data.category),
      author: String(data.author),
      cover: await media(String(data.cover), String(data.title)),
      // Markdown → Lexical. Panel BlockEditor'i shu formatni o'qiydi.
      body: fromText(content.trim()) as never,
      order,
    },
  });
  console.log(`maqola: ${file}`);
}

console.log("\nTayyor.");
process.exit(0);
