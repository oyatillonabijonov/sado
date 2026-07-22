import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import BlogCard from "@/components/BlogCard";
import { getAllPosts, getPost, getRelatedPosts } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
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
  const post = getPost(slug);
  if (!post) notFound();
  const related = getRelatedPosts(slug, post.meta.category);

  return (
    <article className="px-[16px] pt-[120px]">
      {/* Sarlavha — saytning chapga tekislangan tizimida */}
      <header className="border-t border-graphite pt-[20px]">
        <Link href="/blog" className="text-fog-gray hover:text-bone-white">
          ← Blog
        </Link>
        <h1 className="display mt-[48px] max-w-[1000px]">{post.meta.title}</h1>
      </header>

      {/* Meta — spec-sheet qatori */}
      <div className="mt-[64px] grid gap-[16px] border-t border-graphite pt-[16px] sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="relative mt-[64px] aspect-[21/9] w-full bg-soft-black">
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
      <div className="mt-[120px] grid gap-[48px] lg:grid-cols-[240px_minmax(0,720px)]">
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
        <section className="mt-[160px] border-t border-graphite pt-[20px]">
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
