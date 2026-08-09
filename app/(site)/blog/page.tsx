import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import BlogFilterGrid from "@/components/BlogFilterGrid";
import EmptyState from "@/components/EmptyState";
import { getAllPosts, getBlogCategories } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Dizayn, brending va raqamli mahsulotlar haqida fikrlarimiz.",
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getAllPosts(), getBlogCategories()]);
  return (
    <div className="shell pt-[48px]">
      <SectionHeading kicker="Fikrlar">Blog</SectionHeading>
      {posts.length === 0 ? (
        <EmptyState
          title="Birinchi maqola yozilmoqda."
          hint="Dizayn va brending haqidagi kuzatuvlarimizni shu yerda chop etamiz."
          action={{ href: "/about#aloqa", label: "Bog'lanish" }}
        />
      ) : (
        <BlogFilterGrid posts={posts} categories={categories} />
      )}
    </div>
  );
}
