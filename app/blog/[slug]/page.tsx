import type { Metadata } from "next";
import Image from "next/image";
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
      <p className="text-fog-gray">
        {post.meta.category} — {post.meta.date} — {post.meta.readingTime}
      </p>
      <h1 className="display mt-[16px] max-w-[900px]">{post.meta.title}</h1>
      <p className="mt-[48px] text-fog-gray">Muallif: {post.meta.author}</p>

      <div className="relative mt-[120px] aspect-[16/9] w-full max-w-[1200px] bg-soft-black">
        <Image
          src={post.meta.cover}
          alt={post.meta.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="prose-oker mt-[120px]">
        <MDXRemote source={post.content} />
      </div>

      {related.length > 0 && (
        <section className="pt-[240px]">
          <p className="mb-[48px] text-fog-gray">Aloqador maqolalar</p>
          <div className="grid gap-[16px] md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
