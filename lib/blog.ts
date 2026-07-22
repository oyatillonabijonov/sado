import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  cover: string;
  author: string;
  readingTime: string;
}

const BLOG_DIR = path.join(process.cwd(), "content/blog");

function readingTimeOf(text: string) {
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 180))} daqiqa o'qish`;
}

export function getAllPosts(): PostMeta[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: data.title as string,
        description: data.description as string,
        date: data.date as string,
        category: data.category as string,
        cover: data.cover as string,
        author: data.author as string,
        readingTime: readingTimeOf(content),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string) {
  const file = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return {
    meta: {
      slug,
      title: data.title as string,
      description: data.description as string,
      date: data.date as string,
      category: data.category as string,
      cover: data.cover as string,
      author: data.author as string,
      readingTime: readingTimeOf(content),
    } as PostMeta,
    content,
  };
}

export function getBlogCategories(): string[] {
  return Array.from(new Set(getAllPosts().map((p) => p.category)));
}

export function getRelatedPosts(slug: string, category: string, n = 2) {
  const all = getAllPosts().filter((p) => p.slug !== slug);
  const same = all.filter((p) => p.category === category);
  return [...same, ...all.filter((p) => p.category !== category)].slice(0, n);
}
