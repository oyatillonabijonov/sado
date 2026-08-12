import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import BlogCard from "@/components/BlogCard";
import { getAllPosts, getPost, getRelatedPosts } from "@/lib/blog";

export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: { images: [post.meta.cover] },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(slug, post.meta.category);

  return (
    <article className="shell pt-[48px]">
      {/* Sarlavha — saytning chapga tekislangan tizimida */}
      <header className="border-t border-graphite pt-[20px]">
        {/* `w-max`: `tap` padding'i bilan inline-block shrink-to-fit kengligi
            "← Blog" ni ikki qatorga bo'lib tashlardi. */}
        <Link href="/blog" className="tap inline-block w-max text-fog-gray hover:text-bone-white">
          ← Blog
        </Link>
        <h1 className="display mt-[24px] max-w-[1000px] md:mt-[48px]">{post.meta.title}</h1>
      </header>

      {/* Meta — spec-sheet qatori */}
      <div className="mt-[40px] grid grid-cols-2 gap-[16px] border-t border-graphite pt-[16px] md:mt-[64px] lg:grid-cols-4">
        {(
          [
            ["Kategoriya", post.meta.category],
            ["Muallif", post.meta.author],
            ["Sana", post.meta.date],
            ["O'qish vaqti", post.meta.readingTime],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <p className="text-fog-gray">{label}</p>
            <p className="mt-[4px] text-bone-white">{value}</p>
          </div>
        ))}
      </div>

      {/* 16:9 — `BlogCard` bilan bir xil, ya'ni ro'yxatda ko'ringan kadr
          maqolada ham aynan o'sha kadr bo'ladi. Ilgari bu yerda mobilda 4:3,
          desktopda 21:9 turardi va bitta muqova uch xil qirqilardi (21:9
          telefonda 375×160 tasmaga aylanib, rasmdan hech narsa o'qilmasdi). */}
      <div className="relative mt-[40px] aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-soft-black md:mt-[64px]">
        <Image
          src={post.meta.cover}
          alt={post.meta.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Matn — chap rail'da yopishqoq meta, o'ngda o'qish ustuni */}
      <div className="mt-section-sm grid gap-[48px] lg:grid-cols-[240px_minmax(0,720px)]">
        <aside className="hidden lg:block">
          <p className="sticky top-[96px] text-fog-gray">
            {post.meta.category}
          </p>
        </aside>
        <div className="prose-oker">
          <MDXRemote source={post.content} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-section border-t border-graphite pt-[20px]">
          <p className="mb-[48px] text-fog-gray">Aloqador maqolalar</p>
          <div className="grid gap-x-[16px] gap-y-[48px] md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
