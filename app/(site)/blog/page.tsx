import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import BlogFilterGrid from "@/components/BlogFilterGrid";
import { getAllPosts, getBlogCategories } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Dizayn, brending va raqamli mahsulotlar haqida fikrlarimiz.",
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getAllPosts(), getBlogCategories()]);
  return (
    <div className="px-[16px] pt-[120px]">
      <SectionHeading kicker="Fikrlar">Blog</SectionHeading>
      <BlogFilterGrid posts={posts} categories={categories} />
    </div>
  );
}
